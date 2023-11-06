import React, { useContext } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MetaDataContext } from "/pages/_app.js";
import LogicalSetComponent from "@components/flow/conditions/sakai/condition-components/LogicalSetComponent";
import {
	faArrowDown,
	faArrowUp,
	faEdit,
	faEye,
	faEyeSlash,
	faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import { uniqueId } from "@utils/Utils";

function GradeComponent({
	blockData,
	setBlockData,
	gradeConditions,
	setConditionEdit,
	deleteRequisite,
}) {
	const { metaData } = useContext(MetaDataContext);

	const logicalSetAnd = gradeConditions?.subConditions.find(
		(item) => item.operator === "AND"
	);

	const logicalSetOr = gradeConditions?.subConditions.find(
		(item) => item.operator === "OR"
	);

	function swapConditionToSubRoot(targetSubRoot, conditionIndex) {
		const conditionToSwap =
			targetSubRoot === "AND"
				? logicalSetAnd.subConditions[conditionIndex]
				: logicalSetOr.subConditions[conditionIndex];

		const sourceSubRoot =
			targetSubRoot === "AND" ? logicalSetAnd : logicalSetOr;
		const targetSubRootData =
			targetSubRoot === "AND" ? logicalSetOr : logicalSetAnd;

		// Clone the arrays to avoid modifying the original state directly
		let newSourceSubRoot = sourceSubRoot ? sourceSubRoot : undefined;
		let newTargetSubRoot = targetSubRootData ? targetSubRootData : undefined;

		if (sourceSubRoot) {
			newSourceSubRoot = { ...sourceSubRoot };
		}

		// Remove from source AND add to target
		newSourceSubRoot.subConditions.splice(conditionIndex, 1);
		if (!newTargetSubRoot) {
			newTargetSubRoot = {
				type: "PARENT",
				siteId: metaData.course_id,
				toolId: "sakai.conditions",
				operator: newSourceSubRoot.operator == "AND" ? "OR" : "AND",
			};
		}
		if (newTargetSubRoot?.subConditions) {
			newTargetSubRoot.subConditions.push(conditionToSwap);
		} else {
			newTargetSubRoot.subConditions = [conditionToSwap];
		}
		const newsubConditions = [newSourceSubRoot, newTargetSubRoot];

		let updatedBlockData = { ...blockData };

		updatedBlockData.data.gradeRequisites.subConditions = newsubConditions;

		setBlockData(updatedBlockData);
	}

	return (
		<>
			{((logicalSetAnd?.subConditions &&
				logicalSetAnd.subConditions.length >= 1) ||
				(logicalSetOr?.subConditions &&
					logicalSetOr?.subConditions.length >= 1)) && (
				<div>
					<Row className="align-items-center">
						<Col>
							<div>
								Se <b>deben cumplir TODAS</b> las siguientes condiciones:
							</div>
							{logicalSetAnd?.subConditions &&
								logicalSetAnd?.subConditions.length >= 1 &&
								logicalSetAnd?.subConditions.map((condition, index) => {
									let lastIndex =
										logicalSetAnd.subConditions.length - 1 === index;
									return (
										<LogicalSetComponent
											lastIndex={lastIndex}
											condition={condition}
											setConditionEdit={setConditionEdit}
											deleteRequisite={deleteRequisite}
											swapToOr={() => swapConditionToSubRoot("AND", index)}
										></LogicalSetComponent>
									);
								})}
							{((logicalSetAnd &&
								logicalSetAnd.subConditions &&
								logicalSetAnd.subConditions.length <= 0) ||
								!logicalSetAnd ||
								!logicalSetAnd.subConditions) && (
								<Container
									className="mb-0 mt-3"
									style={{ padding: "10px", border: "1px solid #C7C7C7" }}
								>
									<Row>
										<Col>
											No existen condiciones dentro de este grupo, puedes
											añadirlas utilizando el botón de las flechas entrelazadas
											que se encuentra en cada una de las condiciones
										</Col>
									</Row>
								</Container>
							)}
						</Col>
					</Row>
					<Row className="mb-3 mt-3">
						<Col className="d-flex align-items-center justify-content-center">
							<h1 className="mb-0">Y</h1>
						</Col>
					</Row>
					<Row>
						<Col>
							<div>
								Se <b>debe cumplir UNA</b> de las siguientes condiciones:
							</div>
							{logicalSetOr?.subConditions &&
								logicalSetOr?.subConditions.length >= 1 &&
								logicalSetOr.subConditions.map((condition, index) => {
									let lastIndex =
										logicalSetOr.subConditions.length - 1 === index;
									return (
										<LogicalSetComponent
											lastIndex={lastIndex}
											condition={condition}
											setConditionEdit={setConditionEdit}
											deleteRequisite={deleteRequisite}
											swapToOr={() => swapConditionToSubRoot("OR", index)}
										></LogicalSetComponent>
									);
								})}
							{((logicalSetOr?.subConditions &&
								logicalSetOr?.subConditions.length <= 0) ||
								!logicalSetOr?.subConditions) && (
								<Container
									className="mb-3 mt-3"
									style={{ padding: "10px", border: "1px solid #C7C7C7" }}
								>
									<Row>
										<Col>
											No existen condiciones dentro de este grupo, puedes
											añadirlas utilizando el botón de las flechas entrelazadas
											que se encuentra en cada una de las condiciones
										</Col>
									</Row>
								</Container>
							)}
						</Col>
					</Row>
				</div>
			)}
			{(logicalSetAnd?.subConditions?.length <= 0 ||
				!logicalSetAnd?.subConditions) &&
				(logicalSetOr?.subConditions?.length <= 0 ||
					!logicalSetOr?.subConditions) && (
					<div>
						Actualmente no existe ninguna condición de calificación asociada a
						este bloque, para crear una, deberás realizar una línea o conexión
						entre otro bloque y este para que se genere una condición de
						obligatoriedad de tipo calificación
					</div>
				)}
		</>
	);
}

export default GradeComponent;
