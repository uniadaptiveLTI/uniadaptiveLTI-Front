import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faArrowDown,
	faArrowUp,
	faEdit,
	faEye,
	faEyeSlash,
	faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import { useReactFlow } from "reactflow";

const DateComponent = ({
	requisites,
	parseDate,
	setConditionEdit,
	deleteRequisite,
}) => {
	const dateArray = requisites.filter((item) => item.type === "date");

	return (
		<Container
			className="mb-3 mt-3"
			style={{ padding: "10px", border: "1px solid #C7C7C7" }}
		>
			{dateArray.map((item, index) => (
				<Row className="align-items-center">
					<Col>
						{item.openingDate && (
							<div>Fecha de apertura: {parseDate(item.openingDate, true)}</div>
						)}
						{item.dueDate && (
							<div>Fecha de entrega: {parseDate(item.dueDate, true)}</div>
						)}
					</Col>
					{
						// FEATURE: ENABLE THIS CODE TO ALLOW MULTIPLE DATE CONDITIONS
						/*<Col className="col-2">
						<Button
							variant="light"
							onClick={() => setConditionEdit(dateArray[index])}
						>
							<div>
								<FontAwesomeIcon icon={faEdit} />
							</div>
						</Button>
						<Button variant="light" onClick={() => deleteRequisite(item.id)}>
							<div>
								<FontAwesomeIcon icon={faTrashCan} />
							</div>
						</Button>
						</Col>*/
					}
				</Row>
			))}
		</Container>
	);
};

export default DateComponent;
