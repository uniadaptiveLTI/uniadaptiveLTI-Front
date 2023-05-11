import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrashCan } from "@fortawesome/free-solid-svg-icons";

const userProfileOperatorList = [
	{ value: "firstName", name: "Nombre" },
	{ value: "lastName", name: "Apellido" },
	{ value: "city", name: "Ciudad" },
	{ value: "department", name: "Departamento" },
	{ value: "address", name: "Dirección" },
	{ value: "emailAddress", name: "Dirección de correo" },
	{ value: "institution", name: "Institución" },
	{ value: "idNumber", name: "Número de ID" },
	{ value: "country", name: "País" },
	{ value: "telephone", name: "Teléfono" },
	{ value: "mobilePhone", name: "Teléfono Movil" },
];
const userProfileQueryList = [
	{ value: "equals", name: "es igual a" },
	{ value: "contains", name: "contiene" },
	{ value: "notContains", name: "no contiene" },
	{ value: "startsWith", name: "comienza con" },
	{ value: "endsWith", name: "termina en" },
	{ value: "empty", name: "está vacío" },
	{ value: "notEmpty", name: "no está vacío" },
];

const UserProfileComponent = ({
	condition,
	setConditionEdit,
	deleteCondition,
}) => {
	return (
		<Container
			className="mb-3 mt-3"
			style={{ padding: "10px", border: "1px solid #C7C7C7" }}
		>
			<Row>
				<Col>
					<div>Tipo: Perfil de usuario</div>
					<div>
						Su{" "}
						<strong>
							{
								userProfileOperatorList.find(
									(item) => item.value === condition.op
								)?.name
							}
						</strong>{" "}
						{
							userProfileQueryList.find(
								(item) => item.value === condition.query
							)?.name
						}{" "}
						<strong>{condition.objective}</strong>
					</div>
				</Col>
				<Col className="col d-flex align-items-center gap-2">
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

export default UserProfileComponent;
