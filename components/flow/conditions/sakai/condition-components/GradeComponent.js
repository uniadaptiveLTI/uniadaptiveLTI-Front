import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import LogicalSetComponent from "@conditionsSakai/condition-components/LogicalSetComponent";
import {
	faArrowDown,
	faArrowUp,
	faEdit,
	faEye,
	faEyeSlash,
	faTrashCan,
} from "@fortawesome/free-solid-svg-icons";

function GradeComponent({ gradeConditions, setConditionEdit }) {
	const logicalSetAnd = gradeConditions.logicalSets.find(
		(item) => item.op === "and"
	);
	const logicalSetOr = gradeConditions.logicalSets.find(
		(item) => item.op === "or"
	);
	return (
		<Row className="align-items-center">
			<Col>
				<div>
					Se <b>deben cumplir TODAS</b> las siguientes condiciones
				</div>
				{logicalSetAnd.conditions.map((condition) => {
					return (
						<LogicalSetComponent
							condition={condition}
							setConditionEdit={setConditionEdit}
						></LogicalSetComponent>
					);
				})}
			</Col>
			<Row>
				<div>
					Solo <b>debe cumplirse UNA</b> de las siguientes condiciones
				</div>
				{logicalSetOr.conditions.map((condition) => {
					return (
						<LogicalSetComponent
							condition={condition}
							setConditionEdit={setConditionEdit}
						></LogicalSetComponent>
					);
				})}
			</Row>
		</Row>
	);
}

export default GradeComponent;
