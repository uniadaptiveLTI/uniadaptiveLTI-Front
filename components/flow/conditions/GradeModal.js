import React, { useEffect, useRef, useState } from "react";
import styles from "@root/styles/ConditionModal.module.css";
import { Modal, Button, Form, Row, Col, Container } from "react-bootstrap";
import { faShuffle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { uniqueId } from "@utils/Utils";
import { useReactFlow } from "reactflow";

function GradeModal({
	blockData,
	setBlockData,
	blocksData,
	onEdgesDelete,
	showConditionsModal,
	setShowConditionsModal,
}) {
	const reactFlowInstance = useReactFlow();

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
			<Modal.Body></Modal.Body>
			<Modal.Footer></Modal.Footer>
		</Modal>
	);
}

export default GradeModal;
