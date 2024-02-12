import { IMetaData, ISection } from "@components/interfaces/IMetaData";
import { IElementNodeData, INode } from "@components/interfaces/INode";
import { INodeError } from "@components/interfaces/INodeError";
import {
	faExclamationCircle,
	faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getAutomaticReusableStyles, getRootStyle } from "@utils/Colors";
import { getNodeById } from "@utils/Nodes";
import { Platforms } from "@utils/Platform";
import { orderByPropertyAlphabetically } from "@utils/Utils";
import {
	forwardRef,
	useState,
	useLayoutEffect,
	useRef,
	ReactNode,
} from "react";
import { Form } from "react-bootstrap";
import { useNodes } from "reactflow";

function getDuplicates(array) {
	let count = {};
	for (let i = 0; i < array.length; i++) {
		let element = array[i];
		count[element] = count[element] ? count[element] + 1 : 1;
	}
	return count;
}

interface SelectionChangeOptions {
	selection: Array<number>;
	errors: Array<number>;
	warnings: Array<number>;
}

interface SectionSelectionProps {
	allowModularSelection?: boolean;
	metaData: IMetaData;
	showErrors: boolean;
	errorList: Array<INodeError>;
	warningList: Array<INodeError>;
	handleSelectionChange: (arg0: SelectionChangeOptions) => void;
	mapName: string;
}

const SectionSelector = forwardRef(
	(
		{
			allowModularSelection = true,
			metaData,
			showErrors,
			errorList,
			warningList,
			handleSelectionChange,
			mapName,
		}: SectionSelectionProps,
		ref: React.Ref<any>
	) => {
		const rfNodes = useNodes();
		const SECTIONS =
			metaData.platform == Platforms.Moodle
				? metaData.sections
				: [
						...new Set(
							rfNodes
								.map((node: INode) =>
									"section" in node.data
										? metaData.sections.find(
												(section) =>
													section.position ==
													(node.data as IElementNodeData).section
										  )
										: undefined
								)
								.filter(Boolean)
						),
				  ];
		//Gets the sections from the MetaData or autocalculates them based of the ElementNodes with sections in the map

		const [selectors, setSelectors] = useState<ReactNode>();
		const [selectionStatus, setSelectionStatus] = useState([]);
		const [updateSelectors, setUpdateSelectors] = useState(false);
		const [waitForWarnings, setWaitForWarnings] = useState(true);
		const innerSelectors = useRef([]);
		const [errorsPerSection, setErrorsPerSection] = useState([]);
		const [warningsPerSection, setWarningsPerSection] = useState([]);

		//Checks if it has to wait for the warnings to generate
		useLayoutEffect(() => {
			if (showErrors == false) setWaitForWarnings(false);
		}, []);

		//Checks if it has errors or warnings (has to wait for the warnings to generate)
		useLayoutEffect(() => {
			if (showErrors == true && warningList != undefined) {
				getErrorsPerSection();
				setWaitForWarnings(false);
			}
		}, [warningList]);

		//Generates the selectors for the sections depending if only the general map selector is needed it needs more granulaty
		useLayoutEffect(() => {
			if (!waitForWarnings) {
				if (allowModularSelection) {
					setSelectionStatus([]);

					const ORDERED_SELECTORS = (
						orderByPropertyAlphabetically(
							SECTIONS.map((section, idx) => {
								return {
									position: String(section.position), //ToString to be sorted
									html: (
										<div
											style={{ display: "flex", alignItems: "center" }}
											className="my-2 ms-4"
										>
											<Form.Check
												key={section.position}
												ref={(el) => (innerSelectors.current[idx] = el)}
												onClick={() => setUpdateSelectors(true)}
												type="switch"
												label={section.position + "- " + section.name}
												data-id={section.position}
											/>
											{showErrors && (
												<div className="d-flex ms-2" style={{ gap: "10px" }}>
													{errorsPerSection[section.position] > 0 && (
														<FontAwesomeIcon
															icon={faExclamationCircle}
															style={{
																color: getRootStyle("--error-background-color"),
															}}
															title={`${
																errorsPerSection[section.position]
															} error(es)`}
														/>
													)}
													{warningsPerSection[section.position] > 0 && (
														<FontAwesomeIcon
															icon={faExclamationTriangle}
															style={{
																color: getRootStyle(
																	"--warning-background-color"
																),
															}}
															title={`${
																warningsPerSection[section.position]
															} advertencia(s)`}
														/>
													)}
												</div>
											)}
										</div>
									),
								};
							}),
							"position"
						) as Array<{ position: string; html: ReactNode }>
					).map((orderedSection) => orderedSection.html);
					ORDERED_SELECTORS.unshift(
						<div
							className="my-2"
							style={{ display: "flex", alignItems: "center" }}
						>
							<Form.Check
								type="switch"
								label={mapName ? mapName : metaData.name}
								onClick={toggleInnerSelectors}
							/>
							{showErrors && (
								<div className="d-flex ms-2" style={{ gap: "10px" }}>
									{errorList.filter((error) => error !== undefined).length >
										0 && (
										<FontAwesomeIcon
											icon={faExclamationCircle}
											style={{
												color: getRootStyle("--error-background-color"),
											}}
											title={`${
												errorList.filter((error) => error !== undefined).length
											} error(es)`}
										/>
									)}
									{warningList.filter((error) => error !== undefined).length >
										0 && (
										<FontAwesomeIcon
											icon={faExclamationTriangle}
											style={{
												color: getRootStyle("--warning-background-color"),
											}}
											title={`${
												warningList.filter((error) => error !== undefined)
													.length
											} advertencia(s)`}
										/>
									)}
								</div>
							)}
						</div>
					);
					setSelectors(ORDERED_SELECTORS);
				} else {
					setSelectors(
						<div
							className="my-2"
							style={{ display: "flex", alignItems: "center" }}
						>
							<Form.Check
								type="switch"
								label={mapName ? mapName : metaData.name}
								onClick={toggleMainSelector}
							/>
							{showErrors && (
								<div className="d-flex ms-2" style={{ gap: "10px" }}>
									{errorList.length > 0 && (
										<FontAwesomeIcon
											icon={faExclamationCircle}
											style={{
												color: getRootStyle("--error-background-color"),
											}}
											title={`${errorList.length} error(es)`}
										/>
									)}
									{warningList.length > 0 && (
										<FontAwesomeIcon
											icon={faExclamationTriangle}
											style={{
												color: getRootStyle("--warning-background-color"),
											}}
											title={`${warningList.length} advertencia(s)`}
										/>
									)}
								</div>
							)}
						</div>
					);
				}
			}
		}, [waitForWarnings == false]);

		function toggleInnerSelectors(e) {
			const TARGET_STATUS = e.target.checked;
			innerSelectors.current.forEach((input) => {
				input.checked = TARGET_STATUS;
				input.disabled = TARGET_STATUS;
				return input;
			});
			setSelectionStatus((prev) => {
				if (TARGET_STATUS) {
					return SECTIONS.map((section) => section.position);
				} else {
					return [];
				}
			});
		}

		function toggleMainSelector(e) {
			const TARGET_STATUS = e.target.checked;
			if (metaData.platform == Platforms.Moodle) {
				const SECTION_POSITIONS = SECTIONS.map((section) => section.position);
				setSelectionStatus(TARGET_STATUS ? SECTION_POSITIONS : []);
			} else {
				console.log("🚀 ~ toggleMainSelector ~ SECTIONS:", SECTIONS);
				setSelectionStatus(
					TARGET_STATUS
						? [
								...new Set(
									rfNodes.map((node: INode) => {
										if ("section" in node.data)
											SECTIONS.find(
												(section) =>
													(node.data as IElementNodeData).section == section.id
											);
									})
								),
						  ]
						: []
				);
			}
		}

		useLayoutEffect(() => {
			if (updateSelectors) {
				setUpdateSelectors(false);

				const NEW_SELECTED_SECTIONS = [];
				innerSelectors.current.forEach((selector) => {
					const targetStatus = selector.checked;
					if (targetStatus) {
						NEW_SELECTED_SECTIONS.push(Number(selector.dataset.id));
					}
				});
				setSelectionStatus(NEW_SELECTED_SECTIONS);
			}
		}, [updateSelectors]);

		useLayoutEffect(() => {
			handleSelectionChange({
				selection: selectionStatus,
				errors: errorsPerSection,
				warnings: warningsPerSection,
			});
		}, [selectionStatus]);

		function getErrorsPerSection() {
			const ERROR_SEARCH = errorList.map((error) => {
				return {
					id: error.nodeId,
					section: getNodeById(error.nodeId, rfNodes).data.section,
				};
			});
			const WARNING_SEARCH = warningList.map((warning) => {
				return {
					id: warning.nodeId,
					section: getNodeById(warning.nodeId, rfNodes).data.section,
				};
			});

			const ERROR_SUM = getDuplicates(
				ERROR_SEARCH.map((errorS) => errorS.section)
			);
			const WARNING_SUM = getDuplicates(
				WARNING_SEARCH.map((warningS) => warningS.section)
			);

			const ERRORS_PER_SECTION_ARRAY = [];
			const WARNINGS_PER_SECTION_ARRAY = [];
			for (const SECTION in ERROR_SUM) {
				const SECTION_ERRORRS = ERROR_SUM[SECTION];
				ERRORS_PER_SECTION_ARRAY[SECTION] = SECTION_ERRORRS;
			}
			for (const SECTION in WARNING_SUM) {
				const SECTION_WARNINGS = WARNING_SUM[SECTION];
				WARNINGS_PER_SECTION_ARRAY[SECTION] = SECTION_WARNINGS;
			}
			console.log("ERRORS_PER_SECTION_ARRAY", ERRORS_PER_SECTION_ARRAY);
			setErrorsPerSection(ERRORS_PER_SECTION_ARRAY);
			setWarningsPerSection(WARNINGS_PER_SECTION_ARRAY);
		}

		return (
			<>
				<Form className="ms-2">{selectors}</Form>
			</>
		);
	}
);
export default SectionSelector;
