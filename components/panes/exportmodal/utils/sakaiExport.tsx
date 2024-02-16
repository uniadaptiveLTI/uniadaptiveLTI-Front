import { INode } from "@components/interfaces/INode";
import { ISendNodesPayload } from "../ExportPane";
import { IMetaData, ISakaiLesson } from "@components/interfaces/IMetaData";
import { sakaiTypeSwitch } from "@utils/Sakai";

interface sakaiNode {
	id: string;
	c: any;
	section: number;
	indent: number;
	order: number;
	label: string;
	type: INode["type"];
	pageId: number;
	openDate?: number;
	closedDate?: number;
	dueDate?: number;
	closeDate?: number;
	dateRestricted?: boolean;
	groupRefs?: Array<any>;
	timeExceptions?: Array<dateException>;
}

interface dateException {
	openDate?: number;
	dueDate?: number;
	closeDate?: number;
	forEntityRef?: string;
}

function fixGradables(nodeArray: Array<INode>) {
	const CONDITION_LIST = [];

	nodeArray.map((node) => {
		if (
			"g" in node.data &&
			node.data.g &&
			"subConditions" in node.data.g &&
			node.data.g.subConditions.length >= 1
		) {
			const newCondition = { ...node.data.g };

			let blockResource = nodeArray.find(
				(node) => node.id == newCondition.itemId
			).data.lmsResource;

			newCondition.itemId = sakaiTypeSwitch({
				id: blockResource,
				type: newCondition.itemType,
			}).contentRef;

			delete newCondition?.itemType;

			newCondition?.subConditions.map((subCondition) => {
				if (
					subCondition.subConditions &&
					subCondition.subConditions.length >= 1
				) {
					subCondition.subConditions.map((childCondition) => {
						let childResource = nodeArray.find(
							(node) => node.id == childCondition.itemId
						).data.lmsResource;

						childCondition.itemId = sakaiTypeSwitch({
							id: childResource,
							type: childCondition.itemType,
						}).contentRef;
						delete childCondition?.itemType;
					});
				}
			});
			CONDITION_LIST.push(newCondition);
		}
	});
	return CONDITION_LIST;
}

function fixRequisites(nodeArray: Array<INode>, lessonID: ISakaiLesson["id"]) {
	return nodeArray.map((node) => {
		if ("requisites" in node.data) {
			const newNode: sakaiNode = {
				...node,
				section: node.data.section,
				indent: node.data.indent,
				order: node.data.order,
				label: node.data.label,
				c: node.data.requisites, //FIXME
				pageId: Number(lessonID),
			};
			return newNode;
		}
		let section = 0,
			indent = 0,
			order = 0;

		if ("section" in node.data) section = node.data.section;
		if ("indent" in node.data) section = node.data.indent;
		if ("order" in node.data) section = node.data.order;

		const newNodeWithoutRequisites: sakaiNode = {
			...node,
			section: section,
			indent: indent,
			order: order,
			c: undefined,
			label: node.data.label,
			pageId: Number(lessonID),
		};
		return newNodeWithoutRequisites;
	});
}

function fixLessonsAndConditions(
	nodeArray: Array<sakaiNode>,
	metaData: IMetaData,
	lessonID: ISakaiLesson["id"]
) {
	function sakaiExportTypeSwitch(id) {
		switch (id) {
			case "resource":
			case "html":
			case "text":
			case "url":
				return "RESOURCE";
			/* IS NOT SUPPORTED case "folder":
				return { type: 20, contentRef: "" };*/
			case "exam":
				return "ASSESSMENT";
			case "assign":
				return "ASSIGNMENT";
			case "forum":
				return "FORUM";
		}
	}

	const LESSON_FIND = metaData.lessons.find((lesson) => lesson.id === lessonID);
	let resultJson = [];
	let nodesToUpdateRequest = [];

	const UNIQUE_SECTION_COLUMN_PAIRS = new Set();

	const SORTED_SECTION_COLUMN_PAIRS = nodeArray
		.filter((node) => {
			const { section, indent } = node;
			const pairString = `${section}-${indent}`;

			if (!UNIQUE_SECTION_COLUMN_PAIRS.has(pairString)) {
				UNIQUE_SECTION_COLUMN_PAIRS.add(pairString);
				return true;
			}

			return false;
		})
		.map(({ section, indent }) => ({ section, indent }));

	SORTED_SECTION_COLUMN_PAIRS.sort((a, b) => {
		// Compare by "section" first
		if (a.section < b.section) return -1;
		if (a.section > b.section) return 1;

		// If "section" values are the same, compare by "indent" (column)
		return a.indent - b.indent;
	});

	nodeArray.map((node) => {
		const NEW_NODE = { ...node };
		if (NEW_NODE.c && NEW_NODE.c.length >= 1) {
			const DATE_CONDITION = NEW_NODE.c.find(
				(condition) => condition.type === "date"
			);

			const GROUP_CONDITION = NEW_NODE.c.find(
				(condition) => condition.type === "group"
			);

			const DATE_EXCEPTION_CHECK = NEW_NODE.c.some(
				(condition) => condition.type === "dateException"
			);

			if (DATE_CONDITION) {
				if (DATE_CONDITION.openingDate) {
					NEW_NODE.openDate = Date.parse(DATE_CONDITION?.openingDate) / 1000;
				}

				if (node.type === "exam" || node.type === "assign") {
					if (DATE_CONDITION.dueDate) {
						NEW_NODE.dueDate = Date.parse(DATE_CONDITION?.dueDate) / 1000;
					}

					if (DATE_CONDITION?.closeTime) {
						NEW_NODE.closeDate = Date.parse(DATE_CONDITION?.closeTime) / 1000;
					}
				} else {
					if (DATE_CONDITION.dueDate) {
						NEW_NODE.closeDate = Date.parse(DATE_CONDITION?.dueDate) / 1000;
					}
				}

				NEW_NODE.dateRestricted = true;
			}

			if (GROUP_CONDITION) {
				NEW_NODE.groupRefs = [];
				GROUP_CONDITION.groupList.map((group) => {
					NEW_NODE.groupRefs.push(group.id);
				});
			}

			if (DATE_EXCEPTION_CHECK) {
				NEW_NODE.timeExceptions = [];

				let dateExceptionFiltered = NEW_NODE.c.filter(
					(condition) => condition.type === "dateException"
				);
				dateExceptionFiltered.map((exception) => {
					const NEW_EXCEPTION: dateException = {};
					NEW_EXCEPTION.openDate = Date.parse(exception?.openingDate) / 1000;
					NEW_EXCEPTION.dueDate = Date.parse(exception?.dueDate) / 1000;
					NEW_EXCEPTION.closeDate = Date.parse(exception?.closeTime) / 1000;

					if (exception.op && exception.op === "group") {
						NEW_EXCEPTION.forEntityRef =
							"/site/" + metaData.course_id + "/group/" + exception.entityId;
					}

					if (exception.op && exception.op === "user") {
						NEW_EXCEPTION.forEntityRef = "/user/" + exception.entityId;
					}

					NEW_NODE.timeExceptions.push(NEW_EXCEPTION);
				});
			}

			NEW_NODE.type = sakaiExportTypeSwitch(NEW_NODE.type);

			nodesToUpdateRequest.push(NEW_NODE);

			const SECTION_PROCESSED = {};

			SORTED_SECTION_COLUMN_PAIRS.map((sortedNode) => {
				if (!SECTION_PROCESSED[sortedNode.section]) {
					// Process the section if it hasn't been processed yet
					resultJson.push({
						pageId: Number(LESSON_FIND.page_id),
						type: 14,
						title: "",
						format: "section",
					});

					const FILTERED_ARRAY = nodeArray
						.filter(
							(node) =>
								node.section === sortedNode.section &&
								node.indent === sortedNode.indent
						)
						.sort((a, b) => a.order - b.order);

					FILTERED_ARRAY.map((node) => {
						const NODE_TYPE_PARSED = sakaiTypeSwitch(node);
						resultJson.push({
							pageId: Number(LESSON_FIND.page_id),
							type: NODE_TYPE_PARSED.type,
							title: node.label,
							contentRef: NODE_TYPE_PARSED.contentRef,
						});
					});

					SECTION_PROCESSED[sortedNode.section] = true; // Mark the section as processed
				} else {
					resultJson.push({
						pageId: Number(LESSON_FIND.page_id),
						type: 14,
						title: "",
						format: "column",
					});

					const FILTERED_ARRAY = nodeArray
						.filter(
							(node) =>
								node.section === sortedNode.section &&
								node.indent === sortedNode.indent
						)
						.sort((a, b) => a.order - b.order);
					FILTERED_ARRAY.map((node) => {
						const NODE_TYPE_PARSED = sakaiTypeSwitch(node);
						resultJson.push({
							pageId: Number(LESSON_FIND.page_id),
							type: NODE_TYPE_PARSED.type,
							title: node.label,
							contentRef: NODE_TYPE_PARSED.contentRef,
						});
					});
				}
			});

			SORTED_SECTION_COLUMN_PAIRS.sort((a, b) => {
				// Compare by "section" first
				if (a.section < b.section) return -1;
				if (a.section > b.section) return 1;

				// If "section" values are the same, compare by "indent" (column)
				return a.indent - b.indent;
			});
		}
	});

	return { LESSON_FIND, resultJson, nodesToUpdateRequest };
}

function finalClean(nodeArray: Array<sakaiNode>) {
	return nodeArray.map((node) => {
		const newNode: sakaiNode = {
			...node,
		};

		delete newNode.type;
		if ("c" in newNode) delete newNode.c;
		delete newNode.c;
		delete newNode.indent;
		delete newNode.pageId;
		delete newNode.section;
		delete newNode.label;
		return newNode;
	});
}

export default function sakaiExport(
	CLEANED_NODES: Array<INode>,
	metaData: IMetaData,
	lessonID: ISakaiLesson["id"]
): ISendNodesPayload {
	//Filter out generic blocks
	const nodesWithoutGenerics = CLEANED_NODES.filter(
		(node) => node.type !== "generic"
	);
	// Gets the fixed conditions (Sakai Gradables)
	const CONDITION_LIST = fixGradables(nodesWithoutGenerics);

	const nodesWithRequisites = fixRequisites(nodesWithoutGenerics, lessonID);

	const extraParams = fixLessonsAndConditions(
		nodesWithRequisites,
		metaData,
		lessonID
	);

	const nodesCleaned = finalClean(nodesWithRequisites);
	return {
		resources: nodesCleaned,
		resultJson: extraParams.resultJson,
		resultJsonSecondary: extraParams.nodesToUpdateRequest,
		lesson: extraParams.LESSON_FIND,
		conditionList: CONDITION_LIST,
	};
}
