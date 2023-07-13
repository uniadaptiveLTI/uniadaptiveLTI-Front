import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrashCan } from "@fortawesome/free-solid-svg-icons";

const profileOperatorList = [
	{ value: "firstname", name: "Nombre" },
	{ value: "lastname", name: "Apellido" },
	{ value: "city", name: "Ciudad" },
	{ value: "department", name: "Departamento" },
	{ value: "address", name: "Dirección" },
	{ value: "email", name: "Dirección de correo" },
	{ value: "institution", name: "Institución" },
	{ value: "idnumber", name: "Número de ID" },
	{ value: "country", name: "País" },
	{ value: "phone1", name: "Teléfono" },
	{ value: "phone2", name: "Teléfono Movil" },
];
const profileQueryList = [
	{ value: "isequalto", name: "es igual a" },
	{ value: "contains", name: "contiene" },
	{ value: "doesnotcontain", name: "no contiene" },
	{ value: "startswith", name: "comienza con" },
	{ value: "endswith", name: "termina en" },
	{ value: "isempty", name: "está vacío" },
	{ value: "isnotempty", name: "no está vacío" },
];

const ProfileComponent = ({ condition, setConditionEdit, deleteCondition }) => {
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
								profileOperatorList.find((item) => item.value === condition.sf)
									?.name
							}
						</strong>{" "}
						{profileQueryList.find((item) => item.value === condition.op)?.name}{" "}
						<strong>{condition.v}</strong>
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

export default ProfileComponent;
