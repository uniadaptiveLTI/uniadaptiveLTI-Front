import React, { useContext, useEffect, useRef, useState } from "react";
import { Modal, Button, Form, Row, Col, Container } from "react-bootstrap";
import { faShuffle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { uniqueId } from "@utils/Utils";
import { useReactFlow } from "reactflow";
import { getGradable } from "@utils/TypeDefinitions";
import { PlatformContext } from "pages/_app";
import QualificationForm from "@conditionsMoodle/form-components/QualificationForm";

function QualificationModal({
	blockData,
	setBlockData,
	blocksData,
	onEdgesDelete,
	showConditionsModal,
	setShowConditionsModal,
}) {
	const reactFlowInstance = useReactFlow();
	const { platform } = useContext(PlatformContext);

	const gradeConditionType = getGradable(platform)
		.find((declaration) => declaration.type == blockData.type)
		.gradable.find((gradableDec) => gradableDec.lms == platform).type; //Returns the type of gradable for this node type for this platform

	const handleClose = () => {
		setBlockData();
		setShowConditionsModal(false);
	};

	function deepCopy(obj) {
		if (Array.isArray(obj)) {
			return obj.map((item) => deepCopy(item));
		} else if (typeof obj === "object" && obj !== null) {
			return Object.fromEntries(
				Object.entries(obj).map(([key, value]) => [key, deepCopy(value)])
			);
		} else {
			return obj;
		}
	}

	return (
		<Modal size="xl" show={showConditionsModal} onHide={handleClose}>
			<Modal.Header closeButton>
				<Modal.Title>Calificaciones de "{blockData.data.label}"</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				{gradeConditionType}
				<QualificationForm gradeConditionType={gradeConditionType} />
			</Modal.Body>
			<Modal.Footer></Modal.Footer>
		</Modal>
	);
}

export default QualificationModal;
