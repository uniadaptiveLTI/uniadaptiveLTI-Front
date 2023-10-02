import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faEdit,
	faShuffle,
	faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";

const RoleComponent = ({
	condition,
	roleList,
	setConditionEdit,
	deleteCondition,
	swapConditionGroup,
}) => {
	return (
		<Container
			className="mb-3 mt-3"
			style={{ padding: "10px", border: "1px solid #C7C7C7" }}
		>
			<Row className="align-items-center">
				<Col>
					<div>Tipo: Concesión manual por rol</div>
					{condition.method === "&" && (
						<div>
							Esta insignia debe ser otorgada a los usuarios con{" "}
							<strong>TODOS</strong> los siguientes roles:
						</div>
					)}
					{condition.method === "|" && (
						<div>
							Esta insignia debe ser otorgada a los usuarios con{" "}
							<strong>CUALQUIERA</strong> de los siguientes roles:
						</div>
					)}
					<ul>
						{condition.params.map((option) => {
							const role = roleList.find(
								(role) => role.id.toString() === option
							);
							return <li key={role.id}>{role.name}</li>;
						})}
					</ul>
					<div>{condition.description}</div>
				</Col>
				<Col className="col-md-2 d-flex align-items-center gap-2">
					<Button variant="light" onClick={() => setConditionEdit(condition)}>
						<div>
							<FontAwesomeIcon icon={faEdit} />
						</div>
					</Button>
					<Button variant="light" onClick={() => deleteCondition(condition.id)}>
						<div>
							<FontAwesomeIcon icon={faTrashAlt} />
						</div>
					</Button>
					<Button variant="light" onClick={() => swapConditionGroup(condition)}>
						<div>
							<FontAwesomeIcon icon={faShuffle} />
						</div>
					</Button>
				</Col>
			</Row>
		</Container>
	);
};

export default RoleComponent;
