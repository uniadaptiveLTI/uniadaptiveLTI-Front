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

const ProfileComponent = ({
	condition,
	conditionsList,
	setConditionEdit,
	upCondition,
	downCondition,
	deleteCondition,
	swapConditionParam,
}) => {
	const mainCondition = conditionsList.c.some((c) => c.id === condition.id);

	return (
		<Container
			className="mb-3 mt-3"
			style={{ padding: "10px", border: "1px solid #C7C7C7" }}
		>
			<Row className="align-items-center">
				{mainCondition && conditionsList.op === "&" && (
					<Col className="col-1">
						<Button
							variant="light"
							onClick={() => swapConditionParam(condition, "showc")}
						>
							<div>
								{condition.showc ? (
									<FontAwesomeIcon icon={faEye} />
								) : (
									<FontAwesomeIcon icon={faEyeSlash} />
								)}
							</div>
						</Button>
					</Col>
				)}
				<Col style={{ width: "531px", flex: "0 0 auto" }}>
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
				<Col className="col d-flex align-items-center justify-content-end gap-2">
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
					{conditionsList.c.length >= 2 && (
						<>
							<Button variant="light" onClick={() => upCondition(condition)}>
								<div>
									<FontAwesomeIcon icon={faArrowUp} />
								</div>
							</Button>
							<Button variant="light" onClick={() => downCondition(condition)}>
								<div>
									<FontAwesomeIcon icon={faArrowDown} />
								</div>
							</Button>
						</>
					)}
				</Col>
			</Row>
		</Container>
	);
};

export default ProfileComponent;
