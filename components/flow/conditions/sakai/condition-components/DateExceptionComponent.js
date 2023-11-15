import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { useReactFlow } from "reactflow";

const DateExceptionComponent = ({
	requisites,
	sakaiGroups,
	sakaiUsers,
	parseDate,
	deleteRequisite,
}) => {
	const DATE_EXCEPTION_ARRAY = requisites.filter(
		(item) => item.type === "dateException"
	);

	return (
		<Container className="mb-3 mt-3">
			<div>
				{DATE_EXCEPTION_ARRAY.map((item, index) => {
					let entityInfo = null;

					if (item.op === "user") {
						const USER = sakaiUsers.find((user) => user.id === item.entityId);

						if (USER) {
							entityInfo = "Usuario: " + USER.name;
						}
					} else if (item.op === "group") {
						const GROUP = sakaiGroups.find(
							(group) => group.id === item.entityId
						);
						if (GROUP) {
							entityInfo = "Grupo: " + GROUP.name;
						}
					}
					return (
						<Row
							className="align-items-center"
							style={{
								marginTop: "10px",
								padding: "10px",
								border: "1px solid #C7C7C7",
							}}
						>
							<Col>
								<div key={index}>
									<div>{entityInfo}</div>
									<div>
										Fecha de apertura: {parseDate(item.openingDate, true)}
									</div>
									<div>Fecha de entrega: {parseDate(item.dueDate, true)}</div>
									<div>Fecha límite: {parseDate(item.closeTime, true)}</div>
								</div>
							</Col>
							<Col className="col-md-auto">
								<Button
									variant="light"
									onClick={() => deleteRequisite(item.id, true)}
								>
									<div>
										<FontAwesomeIcon icon={faTrashCan} />
									</div>
								</Button>
							</Col>
							<br></br>
						</Row>
					);
				})}
			</div>
		</Container>
	);
};

export default DateExceptionComponent;
