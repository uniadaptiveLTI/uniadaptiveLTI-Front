import { forwardRef, useContext, useState } from "react";
import { Modal, Button, Container, Col, Row, Tabs, Tab } from "react-bootstrap";
import { PlatformContext } from "@root/pages/_app";
import { NodeTypes } from "@utils/TypeDefinitions";
import {
	orderByPropertyAlphabetically,
	uniqueId,
	getNodeById,
	getParentsNode,
} from "@utils/Nodes";
import { getTypeIcon, getTypeStaticColor } from "@utils/NodeIcons";
import styles from "@root/styles/NodeSelector.module.css";
import { createItemErrors } from "@utils/ErrorHandling";
import { useReactFlow } from "reactflow";
import { useEffect } from "react";
import {
	faExclamationCircle,
	faExclamationTriangle,
	faFileExport,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default forwardRef(function NodeSelector(
	{ showDialog, toggleDialog, metadata, userdata, errorList, callback },
	ref
) {
	const [key, setKey] = useState();

	const { platform } = useContext(PlatformContext);
	const reactFlowInstance = useReactFlow();

	const [warningList, setWarningList] = useState();

	const [nodeErrorResourceList, setNodeErrorResourceList] = useState();
	const [nodeErrorSectionList, setNodeErrorSectionList] = useState();
	const [nodeErrorOrderList, setNodeErrorOrderList] = useState();

	const [nodeWarningChildrenList, setNodeWarningChildrenList] = useState();
	const [nodeWarningParentList, setNodeWarningParentList] = useState();

	const formatErrorList = () => {
		console.log(JSON.stringify(metadata));
	};

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

	/**
	 * {
	 * return_url
	 * userID
	 * mapID
	 * version:{}
	 * }
	 */
	function keyErrorCheck() {
		if (errorList.length <= 0) {
			setKey("warning");
		} else {
			setKey("error");
		}
	}

	useEffect(() => {
		keyErrorCheck();

		const newArray = reactFlowInstance
			.getNodes()
			.filter(
				(json) =>
					(!json.data.children ||
						json.data.children?.length == 0 ||
						getParentsNode(reactFlowInstance.getNodes(), json.id).length <=
							0) &&
					json.type !== "remgroup" &&
					json.type !== "addgroup" &&
					json.type !== "fragment" &&
					json.type !== "end" &&
					json.type !== "badge"
			);

		const errorResourceNotFound = errorList
			.filter(
				(entry) =>
					entry.seriousness === "error" && entry.type === "resourceNotFound"
			)
			.map((error) => ({
				...error,
				nodeName: getNodeById(error.nodeId, reactFlowInstance.getNodes()).data
					.label,
			}));

		const errorSectionNotFound = errorList
			.filter(
				(entry) =>
					entry.seriousness === "error" && entry.type === "sectionNotFound"
			)
			.map((error) => ({
				...error,
				nodeName: getNodeById(error.nodeId, reactFlowInstance.getNodes()).data
					.label,
			}));

		const errorOrderNotFound = errorList
			.filter(
				(entry) =>
					entry.seriousness === "error" && entry.type === "orderNotFound"
			)
			.map((error) => ({
				...error,
				nodeName: getNodeById(error.nodeId, reactFlowInstance.getNodes()).data
					.label,
			}));

		const warningChildrenNotFound = errorList
			.filter(
				(entry) =>
					entry.seriousness === "warning" && entry.type === "childrenNotFound"
			)
			.map((error) => ({
				...error,
				nodeName: getNodeById(error.nodeId, reactFlowInstance.getNodes()).data
					.label,
			}));

		const warningParentNotFound = errorList
			.filter(
				(entry) =>
					entry.seriousness === "warning" && entry.type === "parentNotFound"
			)
			.map((error) => ({
				...error,
				nodeName: getNodeById(error.nodeId, reactFlowInstance.getNodes()).data
					.label,
			}));

		setNodeErrorResourceList(errorResourceNotFound);
		setNodeErrorSectionList(errorSectionNotFound);
		setNodeErrorOrderList(errorOrderNotFound);

		setNodeWarningChildrenList(warningChildrenNotFound);
		setNodeWarningParentList(warningParentNotFound);
	}, []);

	return (
		<Modal show={showDialog} onHide={toggleDialog} centered>
			<Modal.Header closeButton>
				<Modal.Title>Exportación</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Tabs
					defaultActiveKey="profile"
					id="fill-tab-example"
					className="mb-3"
					activeKey={key}
					onSelect={(k) => setKey(k)}
					fill
				>
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
								<div>
									<div>
										Los siguientes bloques no poseen un recurso asociado:
									</div>
									{nodeErrorResourceList.map((entry) => (
										<div key={entry.id}>{entry.nodeName}</div>
									))}
								</div>
							)}

							{nodeErrorSectionList && nodeErrorSectionList?.length > 0 && (
								<div>
									<div>
										Los siguientes bloques no poseen una sección asignada:
									</div>
									{nodeErrorSectionList.map((entry) => (
										<div key={entry.id}>{entry.nodeName}</div>
									))}
								</div>
							)}

							{nodeErrorOrderList && nodeErrorOrderList?.length > 0 && (
								<div>
									<div>Los siguientes bloques no poseen un orden asignado:</div>
									{nodeErrorOrderList.map((entry) => (
										<div key={entry.id}>{entry.nodeName}</div>
									))}
								</div>
							)}

							{/*JSON.stringify(metadata)*/}
							{/*JSON.stringify(userdata)*/}
						</Tab>
					)}
					<Tab
						eventKey="warning"
						className="border-warning"
						title={
							<div className="text-warning border-warning">
								<FontAwesomeIcon icon={faExclamationTriangle}></FontAwesomeIcon>{" "}
								<a>Advertencias</a>
							</div>
						}
					>
						<div>
							{nodeWarningChildrenList &&
								nodeWarningChildrenList?.length > 0 && (
									<div>
										<div>
											Los siguientes bloques no poseen una salida a otro bloque:
										</div>
										{nodeWarningChildrenList.map((entry) => (
											<div key={entry.id}>{entry.nodeName}</div>
										))}
									</div>
								)}
						</div>
						<div>
							{nodeWarningParentList && nodeWarningParentList?.length > 0 && (
								<div>
									<div>Los siguientes bloques no poseen un padre:</div>
									{nodeWarningParentList.map((entry) => (
										<div key={entry.id}>{entry.nodeName}</div>
									))}
								</div>
							)}
						</div>
					</Tab>
					<Tab
						eventKey="longer-tab"
						title={
							<div className="text-success border-success">
								<FontAwesomeIcon icon={faFileExport}></FontAwesomeIcon>{" "}
								<a>Exportación</a>
							</div>
						}
					>
						Tab content for Loooonger Tab
					</Tab>
				</Tabs>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={toggleDialog}>
					Cancelar
				</Button>
			</Modal.Footer>
		</Modal>
	);
});
