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
	const dateExceptionArray = requisites.filter(
		(item) => item.type === "dateException"
	);
	return (
		<Container className="mb-3 mt-3">
			<div>
				{dateExceptionArray.map((item, index) => {
					let entityInfo = null;

					if (item.op === "user") {
						const user = sakaiUsers.find((user) => user.id === item.entityId);

						if (user) {
							entityInfo = "Usuario: " + user.name;
						}
					} else if (item.op === "group") {
						const group = sakaiGroups.find(
							(group) => group.id === item.entityId
						);
						if (group) {
							entityInfo = "Grupo: " + group.name;
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
								</div>
							</Col>
							<Col className="col-2">
								<Button
									variant="light"
									onClick={() => deleteRequisite(item.id)}
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
