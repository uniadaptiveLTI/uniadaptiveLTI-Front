import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrashCan } from "@fortawesome/free-solid-svg-icons";

const DateComponent = ({ condition, setConditionEdit, deleteCondition }) => {
	function transformDate(dateStr) {
		const date = new Date(dateStr);
		const year = date.getFullYear();
		const month = date.getMonth();

		const monthNames = [
			"enero",
			"febrero",
			"marzo",
			"abril",
			"mayo",
			"junio",
			"julio",
			"agosto",
			"septiembre",
			"octubre",
			"noviembre",
			"diciembre",
		];

		const monthName = monthNames[month];
		const day = date.getDate();

		const formattedDate = `${day} de ${monthName} de ${year}`;

		return formattedDate;
	}

	return (
		<Container
			className="mb-3 mt-3"
			style={{ padding: "10px", border: "1px solid #C7C7C7" }}
		>
			<Row>
				<Col>
					<div>Tipo: Fecha</div>
					{condition.d === ">=" && (
						<div>
							En esta fecha <strong>{transformDate(condition.t)}</strong> o
							después
						</div>
					)}
					{condition.d === "<" && (
						<div>
							Antes del final de <strong>{transformDate(condition.t)}</strong>
						</div>
					)}
				</Col>
				<Col class="col d-flex align-items-center gap-2">
					<Button variant="light" onClick={() => setConditionEdit(condition)}>
						<div>
							<FontAwesomeIcon icon={faEdit} />
						</div>
					</Button>
					<Button variant="light" onClick={() => deleteCondition(condition.id)}>
						<div>
							<FontAwesomeIcon icon={faTrashCan} />
						</div>
					</Button>
				</Col>
			</Row>
		</Container>
	);
};

export default DateComponent;
