import React, { useContext, useEffect, useRef, useState } from "react";
import { Modal, Button, Form, Row, Col, Container } from "react-bootstrap";
import { getUpdatedArrayById, uniqueId } from "@utils/Utils";
import { useReactFlow } from "reactflow";
import { NodeTypes, getGradable } from "@utils/TypeDefinitions";
import { PlatformContext } from "pages/_app";
import { getNodeById, getNodeTypeGradableType } from "@utils/Nodes";
import QualificationForm from "@components/flow/conditions/moodle/form-components/QualificationForm";
import { hasConditionsNeedingCompletion } from "@utils/Moodle";
import { toast } from "react-toastify";

function QualificationModal({
	blockData,
	showConditionsModal,
	setShowConditionsModal,
}) {
	const reactFlowInstance = useReactFlow();
	const { platform } = useContext(PlatformContext);
	const qualificationFormResult = useRef();

	const GRADE_CONDITION_TYPE = getGradable(platform)
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
				<Modal.Title>
					Ajustes de finalización de "{blockData.data.label}"
				</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				{/*gradeConditionType*/}

				<QualificationForm
					ref={qualificationFormResult}
					gradeConditionType={GRADE_CONDITION_TYPE}
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
							if (qualificationFormResult?.current?.data) {
								const CHILDREN_NODES = blockData.data.children.map((children) =>
									getNodeById(children, reactFlowInstance.getNodes())
								);
								const NEEDING_COMPLETION = CHILDREN_NODES.map((cn) =>
									hasConditionsNeedingCompletion(cn)
								).some((v) => v === true);
								const newG = qualificationFormResult.current.data;

								const saveG = () => {
									const CURRENT_NODE = getNodeById(
										blockData.id,
										reactFlowInstance.getNodes()
									);
									reactFlowInstance.setNodes(
										getUpdatedArrayById(
											{
												...CURRENT_NODE,
												data: {
													...CURRENT_NODE.data,
													g: newG,
												},
											},
											reactFlowInstance.getNodes()
										)
									);
								};

								if (NEEDING_COMPLETION) {
									const CURRENT_GRADABLE_TYPE = getNodeTypeGradableType(
										blockData,
										platform
									);
									if (
										CURRENT_GRADABLE_TYPE &&
										((newG.hasConditions &&
											CURRENT_GRADABLE_TYPE != "simple") ||
											(newG.hasToBeSeen && CURRENT_GRADABLE_TYPE == "simple"))
									) {
										saveG();
									} else {
										toast(
											"No se pudieron cambiar los ajustes de finalización: Existen hijos que requieren que el recurso pueda ser finalizado.",
											{
												hideProgressBar: false,
												autoClose: 6000,
												type: "error",
												position: "bottom-center",
												theme: "light",
											}
										);
									}
								} else {
									saveG();
								}
							}
							handleClose();
						}}
						disabled={Boolean(!qualificationFormResult?.current?.data)}
					>
						Guardar
					</Button>
				</div>
			</Modal.Footer>
		</Modal>
	);
}

export default QualificationModal;
