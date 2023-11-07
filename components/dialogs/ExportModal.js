import { forwardRef, useContext, useLayoutEffect, useState } from "react";
import { Modal, Button, Container, Col, Row, Tabs, Tab } from "react-bootstrap";
import {
	PlatformContext,
	ExpandedAsideContext,
	NodeInfoContext,
	VersionInfoContext,
} from "/pages/_app";
import { NodeTypes } from "@utils/TypeDefinitions";
import {
	orderByPropertyAlphabetically,
	getNodeById,
	getParentsNode,
	getNodeTypeGradableType,
} from "@utils/Nodes";
import { uniqueId } from "@utils/Utils";
import { getTypeIcon, getTypeStaticColor } from "@utils/NodeIcons";
import styles from "/styles/ExportModal.module.css";
import { createItemErrors } from "@utils/ErrorHandling";
import { useReactFlow } from "reactflow";
import { useEffect } from "react";
import {
	faExclamationCircle,
	faExclamationTriangle,
	faFileExport,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ExportPane from "@components/panes/exportmodal/ExportPane";
import { SettingsContext } from "pages/_app";

export default forwardRef(function ExportModal(
	{
		showDialog,
		toggleDialog,
		metaData,
		userData,
		errorList,
		mapName,
		LTISettings,
		selectedVersion,
	},
	ref
) {
	const [key, setKey] = useState();

	const { platform } = useContext(PlatformContext);
	const { expandedAside, setExpandedAside } = useContext(ExpandedAsideContext);
	const { nodeSelected, setNodeSelected } = useContext(NodeInfoContext);
	const { editVersionSelected, setEditVersionSelected } =
		useContext(VersionInfoContext);

	const reactFlowInstance = useReactFlow();

	const [warningList, setWarningList] = useState();
	const [tabsClassName, setTabsClassName] = useState();

	const [nodeErrorResourceList, setNodeErrorResourceList] = useState();
	const [nodeErrorSectionList, setNodeErrorSectionList] = useState();
	const [nodeErrorOrderList, setNodeErrorOrderList] = useState();

	const [nodeWarningChildrenList, setNodeWarningChildrenList] = useState();
	const [nodeChildrenWithoutRestriction, setNodeChildrenWithoutRestriction] =
		useState();
	const [nodeWarningParentList, setNodeWarningParentList] = useState();
	const formatErrorList = () => {
		console.log(JSON.stringify(metaData));
	};
	const { settings } = useContext(SettingsContext);
	const parsedSettings = JSON.parse(settings);
	const fitViewOptions = {
		duration: parsedSettings.reducedAnimations ? 0 : 800,
		padding: 0.25,
	};

	function centerToNode(node) {
		const nodeToCenter = reactFlowInstance
			.getNodes()
			.find((rfNode) => rfNode.id == node.id);
		if (nodeToCenter) {
			const x = nodeToCenter.position.x + nodeToCenter.width / 2;
			const y = nodeToCenter.position.y + nodeToCenter.height / 2;
			reactFlowInstance.setCenter(
				nodeToCenter.position.x + nodeToCenter.width / 2,
				nodeToCenter.position.y + nodeToCenter.height / 2,
				fitViewOptions
			);
		}
	}

	const getErrorList = () => {
		const nodeArray = reactFlowInstance.getNodes();
		const nodeList = errorList.map((error) =>
			getNodeById(error.nodeId, nodeArray)
		);

		const nodeLIs = nodeList.map((node) => (
			<div key={node.id}>
				{/*<FontAwesomeIcon icon={faExclamationTriangle}></FontAwesomeIcon>*/}
				{getTypeIcon(node.type, platform, 16)} {node.data.label}
			</div>
		));
		const nodeUL = <div>{nodeLIs}</div>;
		setNodeErrorList(nodeUL);
	};

	function handleClose(actionClicked) {
		if (callback && actionClicked) {
			if (callback instanceof Function) {
				callback();
			} else {
				console.warn("Callback isn't a function");
			}
		}
		toggleDialog();
	}

	useLayoutEffect(() => {
		if (key) {
			const keyToClassMap = {
				error: "errorTabs",
				warning: "warningTabs",
				success: "successTabs",
			};

			const newTabsClassName = keyToClassMap[key] || "";
			setTabsClassName(newTabsClassName);
		}
	}, [key]);

	useLayoutEffect(() => {
		const warningList = generateWarningList(reactFlowInstance.getNodes());
		setWarningList(warningList);

		console.log("Error List: ", errorList);
		console.log("Warning List: ", warningList);

		const errorResourceNotFound = errorList
			.filter(
				(entry) =>
					entry.severity === "error" && entry.type === "resourceNotFound"
			)
			.map((error) => ({
				...error,
				nodeName: getNodeById(error.nodeId, reactFlowInstance.getNodes())?.data
					?.label,
			}));

		const errorSectionNotFound = errorList
			.filter(
				(entry) =>
					entry.severity === "error" && entry.type === "sectionNotFound"
			)
			.map((error) => ({
				...error,
				nodeName: getNodeById(error.nodeId, reactFlowInstance.getNodes())?.data
					?.label,
			}));

		const errorOrderNotFound = errorList
			.filter(
				(entry) => entry.severity === "error" && entry.type === "orderNotFound"
			)
			.map((error) => ({
				...error,
				nodeName: getNodeById(error.nodeId, reactFlowInstance.getNodes())?.data
					?.label,
			}));

		const warningChildrenNotFound = warningList
			.filter(
				(entry) =>
					entry.seriousness === "warning" && entry.type === "childrenNotFound"
			)
			.map((error) => ({
				...error,
				nodeName: getNodeById(error.nodeId, reactFlowInstance.getNodes())?.data
					?.label,
			}));

		const warningParentNotFound = warningList
			.filter(
				(entry) =>
					entry.seriousness === "warning" && entry.type === "parentNotFound"
			)
			.map((error) => ({
				...error,
				nodeName: getNodeById(error.nodeId, reactFlowInstance.getNodes())?.data
					?.label,
			}));

		setNodeErrorResourceList(errorResourceNotFound);
		setNodeErrorSectionList(errorSectionNotFound);
		setNodeErrorOrderList(errorOrderNotFound);

		setNodeWarningChildrenList(warningChildrenNotFound);
		setNodeWarningParentList(warningParentNotFound);

		if (platform && platform == "moodle") {
			const warningChildrenWithoutRestriction = warningList
				.filter(
					(entry) =>
						entry.seriousness === "warning" &&
						entry.type === "childrenWithoutRestriction"
				)
				.map((error) => ({
					...error,
					nodeName: getNodeById(error.nodeId, reactFlowInstance.getNodes())
						?.data?.label,
				}));

			setNodeChildrenWithoutRestriction(warningChildrenWithoutRestriction);
		}
	}, []);

	const handleEdit = (blockData) => {
		toggleDialog();
		if (expandedAside != true) {
			setExpandedAside(true);
		}
		setEditVersionSelected("");
		setNodeSelected(blockData);
		centerToNode(blockData);
	};

	function generateWarningList(nodeList) {
		const warningArray = [];
		nodeList.forEach((node) => {
			const errorEntry = {
				id: uniqueId(),
				nodeId: node.id,
			};

			if (
				node.type !== "remgroup" &&
				node.type !== "addgroup" &&
				node.type !== "fragment" &&
				node.type !== "mail"
			) {
				let childlessNode = false;

				switch (platform) {
					case "sakai":
						if (node.type !== "exam" && node.type !== "assign") {
							childlessNode = true;
						}
						break;
					case "moodle":
						if (node.type == "badge") {
							childlessNode = true;
						}
				}

				if (
					(!node.data.children || node.data.children.length === 0) &&
					!childlessNode
				) {
					const customEntry = {
						...errorEntry,
						seriousness: "warning",
						type: "childrenNotFound",
					};

					const errorFound = warningArray.find(
						(obj) =>
							obj.nodeId === customEntry.nodeId &&
							obj.seriousness === customEntry.seriousness &&
							obj.type === customEntry.type
					);

					if (!errorFound) {
						warningArray.push(customEntry);
					}
				}

				const parentsNodeArray = getParentsNode(nodeList, node.id);

				if (parentsNodeArray.length <= 0) {
					const customEntry = {
						...errorEntry,
						seriousness: "warning",
						type: "parentNotFound",
					};

					const errorFound = warningArray.find(
						(obj) =>
							obj.nodeId === customEntry.nodeId &&
							obj.seriousness === customEntry.seriousness &&
							obj.type === customEntry.type
					);

					if (!errorFound) {
						warningArray.push(customEntry);
					}
				}

				if (
					platform &&
					platform == "moodle" &&
					node?.data?.children?.length <= 0
				) {
					const customEntry = {
						...errorEntry,
						seriousness: "warning",
						type: "childrenWithoutRestriction",
					};

					const errorFound = warningArray.find(
						(obj) =>
							obj.nodeId === customEntry.nodeId &&
							obj.seriousness === customEntry.seriousness &&
							obj.type === customEntry.type
					);

					if (!errorFound) {
						console.log(node);
						const currentNodeGradableType = getNodeTypeGradableType(
							node,
							platform
						);

						if (
							currentNodeGradableType &&
							currentNodeGradableType == "simple" &&
							node?.data?.g?.hasToBeSeen === true
						) {
							if (node?.data?.g?.hasToBeSeen === true) {
								warningArray.push(customEntry);
							}
						} else {
							if (node?.data?.g?.hasConditions === true) {
								warningArray.push(customEntry);
							}
						}
					}
				}
			}
		});
		console.log(warningArray);
		return warningArray;
	}

	const [warningCount, setWarningCount] = useState(
		warningList != undefined ? warningList.length : 0
	);
	const [hasWarnings, setHasWarnings] = useState(warningCount > 0);

	useLayoutEffect(() => {
		const count = warningList != undefined ? warningList.length : 0;
		setWarningCount(count);
		setHasWarnings(count > 0);
	}, [warningList]);

	return (
		<Modal show={showDialog} onHide={toggleDialog} centered>
			<Modal.Header closeButton>
				<Modal.Title>Exportación</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Tabs
					defaultActiveKey="success"
					id="fill-tab-example"
					className={`${
						styles[
							`${tabsClassName == undefined ? "successTabs" : tabsClassName}`
						]
					} mb-3`}
					activeKey={key}
					onSelect={(k) => setKey(k)}
					fill
				>
					<Tab
						eventKey="success"
						className="border-success"
						title={
							<div className="text-success border-success">
								<FontAwesomeIcon icon={faFileExport}></FontAwesomeIcon>{" "}
								<a>Exportación</a>
							</div>
						}
					>
						<ExportPane
							errorList={errorList}
							warningList={warningList}
							changeTab={setKey}
							metaData={metaData}
							userData={userData}
							mapName={mapName}
							LTISettings={LTISettings}
							selectedVersion={selectedVersion}
						/>
					</Tab>

					{errorList.length > 0 && (
						<Tab
							eventKey="error"
							className="border-danger"
							title={
								<div className="text-danger border-danger">
									<FontAwesomeIcon icon={faExclamationCircle}></FontAwesomeIcon>{" "}
									<a>Errores</a>
								</div>
							}
						>
							{nodeErrorResourceList && nodeErrorResourceList?.length > 0 && (
								<div className="mb-2">
									<div className="mb-2">
										<b>Los siguientes bloques no poseen un recurso asociado:</b>
									</div>
									{nodeErrorResourceList.map((entry) => {
										const node = getNodeById(
											entry.nodeId,
											reactFlowInstance.getNodes()
										);
										return (
											<div key={entry.id} onClick={() => handleEdit(node)}>
												<a role="button" className={styles.iconError}>
													{getTypeIcon(node.type, platform, 16)}
												</a>{" "}
												<a role="button" className={styles.nodeError}>
													{entry.nodeName}
												</a>
											</div>
										);
									})}
								</div>
							)}

							{nodeErrorSectionList && nodeErrorSectionList?.length > 0 && (
								<div className="mb-2">
									<div className="mb-2">
										<b>
											Los siguientes bloques no poseen una sección asignada:
										</b>
									</div>
									{nodeErrorSectionList.map((entry) => {
										const node = getNodeById(
											entry.nodeId,
											reactFlowInstance.getNodes()
										);
										return (
											<div key={entry.id} onClick={() => handleEdit(node)}>
												<a role="button" className={styles.iconError}>
													{getTypeIcon(node.type, platform, 16)}
												</a>{" "}
												<a role="button" className={styles.nodeError}>
													{entry.nodeName}
												</a>
											</div>
										);
									})}
								</div>
							)}

							{nodeErrorOrderList && nodeErrorOrderList?.length > 0 && (
								<div className="mb-2">
									<div className="mb-2">
										<b>Los siguientes bloques no poseen un orden asignado:</b>
									</div>
									{nodeErrorOrderList.map((entry) => {
										const node = getNodeById(
											entry.nodeId,
											reactFlowInstance.getNodes()
										);
										return (
											<div key={entry.id} onClick={() => handleEdit(node)}>
												<a role="button" className={styles.iconError}>
													{getTypeIcon(node.type, platform, 16)}
												</a>{" "}
												<a role="button" className={styles.nodeError}>
													{entry.nodeName}
												</a>
											</div>
										);
									})}
								</div>
							)}

							{/*JSON.stringify(metaData)*/}
							{/*JSON.stringify(userdata)*/}
						</Tab>
					)}

					{hasWarnings && (
						<Tab
							eventKey="warning"
							className="border-warning"
							title={
								<div className="text-warning border-warning">
									<FontAwesomeIcon
										icon={faExclamationTriangle}
									></FontAwesomeIcon>{" "}
									<a>Advertencias</a>
								</div>
							}
						>
							<div>
								{nodeWarningChildrenList != undefined &&
									nodeWarningChildrenList.length >= 1 && (
										<div className="mb-2">
											<div className="mb-2">
												<b>
													Los siguientes bloques no poseen una salida a otro
													bloque:
												</b>
											</div>
											{nodeWarningChildrenList.map((entry) => {
												const node = getNodeById(
													entry.nodeId,
													reactFlowInstance.getNodes()
												);
												return (
													<div key={entry.id} onClick={() => handleEdit(node)}>
														<a role="button" className={styles.iconWarning}>
															{getTypeIcon(node.type, platform, 16)}
														</a>{" "}
														<a role="button" className={styles.nodeWarning}>
															{entry.nodeName}
														</a>
													</div>
												);
											})}
										</div>
									)}
							</div>

							{platform && platform == "moodle" && (
								<div>
									{nodeChildrenWithoutRestriction != undefined &&
										nodeChildrenWithoutRestriction.length >= 1 && (
											<div className="mb-2">
												<div className="mb-2">
													<b>
														Los siguientes bloques no poseen una salida a otro
														bloque a pesar de tener un ajuste de finalización
														definido:
													</b>
												</div>
												{nodeChildrenWithoutRestriction.map((entry) => {
													const node = getNodeById(
														entry.nodeId,
														reactFlowInstance.getNodes()
													);
													return (
														<div
															key={entry.id}
															onClick={() => handleEdit(node)}
														>
															<a role="button" className={styles.iconWarning}>
																{getTypeIcon(node.type, platform, 16)}
															</a>{" "}
															<a role="button" className={styles.nodeWarning}>
																{entry.nodeName}
															</a>
														</div>
													);
												})}
											</div>
										)}
								</div>
							)}

							<div>
								{nodeWarningParentList != undefined &&
									nodeWarningParentList.length > 0 && (
										<div className="mb-2">
											<div className="mb-2">
												<b>Los siguientes bloques no poseen un bloque padre:</b>
											</div>
											{nodeWarningParentList.map((entry) => {
												const node = getNodeById(
													entry.nodeId,
													reactFlowInstance.getNodes()
												);
												return (
													<div key={entry.id} onClick={() => handleEdit(node)}>
														<a role="button" className={styles.iconWarning}>
															{getTypeIcon(node.type, platform, 16)}
														</a>{" "}
														<a role="button" className={styles.nodeWarning}>
															{entry.nodeName}
														</a>
													</div>
												);
											})}
										</div>
									)}
							</div>
						</Tab>
					)}
				</Tabs>
			</Modal.Body>
			<Modal.Footer closeButton>
				<Button variant="secondary" onClick={toggleDialog}>
					Cerrar
				</Button>
			</Modal.Footer>
		</Modal>
	);
});
