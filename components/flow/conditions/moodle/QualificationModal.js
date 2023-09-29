import React, { useContext, useEffect, useRef, useState } from "react";
import { Modal, Button, Form, Row, Col, Container } from "react-bootstrap";
import { getUpdatedArrayById, uniqueId } from "@utils/Utils";
import { useReactFlow } from "reactflow";
import { getGradable } from "@utils/TypeDefinitions";
import { PlatformContext } from "pages/_app";
import { getNodeById } from "@utils/Nodes";
import QualificationForm from "@components/flow/conditionsMoodle/form-components/QualificationForm";

function QualificationModal({
	blockData,
	showConditionsModal,
	setShowConditionsModal,
}) {
	const reactFlowInstance = useReactFlow();
	const { platform } = useContext(PlatformContext);
	const qualificationFormResult = useRef();

	const gradeConditionType = getGradable(platform)
		.find((declaration) => declaration.type == blockData.type)
		.gradable.find((gradableDec) => gradableDec.lms == platform).type; //Returns the type of gradable for this node type for this platform

	const handleClose = () => {
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
				{/*gradeConditionType*/}

				<QualificationForm
					ref={qualificationFormResult}
					gradeConditionType={gradeConditionType}
					blockData={blockData}
					reactFlowInstance={reactFlowInstance}
					initialGrade={{
						...getNodeById(blockData.id, reactFlowInstance.getNodes()).data?.g,
					}}
				/>
			</Modal.Body>
			<Modal.Footer>
				<div>
					<Button variant="danger" onClick={handleClose} className="me-2">
						Cancelar
					</Button>
					<Button
						variant="primary"
						onClick={() => {
							const currentBlock = getNodeById(
								blockData.id,
								reactFlowInstance.getNodes()
							);
							reactFlowInstance.setNodes(
								getUpdatedArrayById(
									{
										...currentBlock,
										data: {
											...currentBlock.data,
											g: qualificationFormResult.current.data,
										},
									},
									reactFlowInstance.getNodes()
								)
							);

							handleClose();
						}}
					>
						Guardar
					</Button>
				</div>
			</Modal.Footer>
		</Modal>
	);
}

export default QualificationModal;
