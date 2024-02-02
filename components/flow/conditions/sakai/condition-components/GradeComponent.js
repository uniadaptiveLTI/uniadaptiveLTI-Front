import React, { useContext } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MetaDataContext } from "pages/_app.tsx";
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

	const LOGICAL_SET_AND = gradeConditions?.subConditions.find(
		(item) => item.operator === "AND"
	);

	const LOGICAL_SET_OR = gradeConditions?.subConditions.find(
		(item) => item.operator === "OR"
	);

	function swapConditionToSubRoot(targetSubRoot, conditionIndex) {
		const CONDITION_TO_SWAP =
			targetSubRoot === "AND"
				? LOGICAL_SET_AND.subConditions[conditionIndex]
				: LOGICAL_SET_OR.subConditions[conditionIndex];

		const SOURCE_SUB_ROOT_DATA =
			targetSubRoot === "AND" ? LOGICAL_SET_AND : LOGICAL_SET_OR;
		const TARGET_SUBROOT_DATA =
			targetSubRoot === "AND" ? LOGICAL_SET_OR : LOGICAL_SET_AND;

		// Clone the arrays to avoid modifying the original state directly
		let NEW_SOURCE_SUBROOT = SOURCE_SUB_ROOT_DATA
			? SOURCE_SUB_ROOT_DATA
			: undefined;
		let NEW_TARGET_SUBROOT = TARGET_SUBROOT_DATA
			? TARGET_SUBROOT_DATA
			: undefined;

		if (SOURCE_SUB_ROOT_DATA) {
			NEW_SOURCE_SUBROOT = { ...SOURCE_SUB_ROOT_DATA };
		}

		// Remove from source AND add to target
		NEW_SOURCE_SUBROOT.subConditions.splice(conditionIndex, 1);
		if (!NEW_TARGET_SUBROOT) {
			NEW_TARGET_SUBROOT = {
				type: "PARENT",
				siteId: metaData.course_id,
				toolId: "sakai.conditions",
				operator: NEW_SOURCE_SUBROOT.operator == "AND" ? "OR" : "AND",
			};
		}
		if (NEW_TARGET_SUBROOT?.subConditions) {
			NEW_TARGET_SUBROOT.subConditions.push(CONDITION_TO_SWAP);
		} else {
			NEW_TARGET_SUBROOT.subConditions = [CONDITION_TO_SWAP];
		}
		const NEW_SUBCONDITIONS = [NEW_SOURCE_SUBROOT, NEW_TARGET_SUBROOT];

		let updatedBlockData = { ...blockData };

		updatedBlockData.data.g.subConditions = NEW_SUBCONDITIONS;

		setBlockData(updatedBlockData);
	}

	return (
		<>
			{((LOGICAL_SET_AND?.subConditions &&
				LOGICAL_SET_AND.subConditions.length >= 1) ||
				(LOGICAL_SET_OR?.subConditions &&
					LOGICAL_SET_OR?.subConditions.length >= 1)) && (
				<div>
					<Row className="align-items-center">
						<Col>
							<div>
								Se <b>deben cumplir TODAS</b> las siguientes condiciones:
							</div>
							{LOGICAL_SET_AND?.subConditions &&
								LOGICAL_SET_AND?.subConditions.length >= 1 &&
								LOGICAL_SET_AND?.subConditions.map((condition, index) => {
									let lastIndex =
										LOGICAL_SET_AND.subConditions.length - 1 === index;
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
							{((LOGICAL_SET_AND &&
								LOGICAL_SET_AND.subConditions &&
								LOGICAL_SET_AND.subConditions.length <= 0) ||
								!LOGICAL_SET_AND ||
								!LOGICAL_SET_AND.subConditions) && (
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
							{LOGICAL_SET_OR?.subConditions &&
								LOGICAL_SET_OR?.subConditions.length >= 1 &&
								LOGICAL_SET_OR.subConditions.map((condition, index) => {
									let lastIndex =
										LOGICAL_SET_OR.subConditions.length - 1 === index;
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
							{((LOGICAL_SET_OR?.subConditions &&
								LOGICAL_SET_OR?.subConditions.length <= 0) ||
								!LOGICAL_SET_OR?.subConditions) && (
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
			{(LOGICAL_SET_AND?.subConditions?.length <= 0 ||
				!LOGICAL_SET_AND?.subConditions) &&
				(LOGICAL_SET_OR?.subConditions?.length <= 0 ||
					!LOGICAL_SET_OR?.subConditions) && (
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
