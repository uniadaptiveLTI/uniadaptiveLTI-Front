import { forwardRef, useContext, useState } from "react";
import { Modal, Button, Container, Col, Row } from "react-bootstrap";
import { PlatformContext } from "@components/pages/_app";
import { NodeTypes } from "../flow/nodes/TypeDefinitions";
import { orderByPropertyAlphabetically, uniqueId, getNodeById } from "../Utils";
import { getTypeIcon, getTypeStaticColor } from "../flow/nodes/NodeIcons";
import styles from "@components/styles/NodeSelector.module.css";
import { useReactFlow } from "reactflow";
import { useEffect } from "react";

export default forwardRef(function NodeSelector(
	{ showDialog, toggleDialog, metadata, userdata, errorList, callback },
	ref
) {
	const { platform } = useContext(PlatformContext);
	const reactFlowInstance = useReactFlow();
	const isCorrect = !errorList?.length > 0;
	const errors = !isCorrect ? errorList.length : 0;
	const [humanErrorList, setHumanErrorList] = useState();

	const getErrorList = () => {
		console.log(reactFlowInstance);
		const nodeArray = reactFlowInstance.getNodes();
		const nodeList = errorList.map((error) => getNodeById(error, nodeArray));
		const nodeLIs = nodeList.map((node) => (
			<li key={node.id}>
				{getTypeIcon(node.type, platform, 16)} {node.data.label}
			</li>
		));
		const nodeUL = <ul>{nodeLIs}</ul>;
		setHumanErrorList(nodeLIs);
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

	useEffect(() => {
		setHumanErrorList(getErrorList);
	}, []);

	return (
		<Modal show={showDialog} onHide={toggleDialog} centered>
			<Modal.Header closeButton>
				<Modal.Title>Exportación</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				{!isCorrect &&
					`Actualmente hay ${errors} errores. Los bloques con errores son los siguientes: \n`}
				{!isCorrect && humanErrorList}
				<br />
				{JSON.stringify(metadata)}
				<br />
				{JSON.stringify(userdata)}
			</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={toggleDialog}>
					Cancelar
				</Button>
			</Modal.Footer>
		</Modal>
	);
});
