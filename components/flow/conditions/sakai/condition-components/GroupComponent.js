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

const GroupComponent = ({
	requisites,
	sakaiGroups,
	setConditionEdit,
	deleteRequisite,
}) => {
	const groupArray = requisites.find((item) => item.type === "group");

	const sortedGroupList = groupArray.groupList.sort(
		(a, b) => a.index - b.index
	);
	return (
		<Container
			className="mb-3 mt-3"
			style={{ padding: "10px", border: "1px solid #C7C7C7" }}
		>
			<Row className="align-items-center">
				<Col>
					<ul>
						{sortedGroupList.map((item, index) => {
							const user = sakaiGroups.find((user) => user.id === item.id);

							return (
								<li key={index}>{user ? user.name : "Grupo no encontrado"}</li>
							);
						})}
					</ul>
				</Col>
				{/* <Col className="col-2">
					<Button variant="light" onClick={() => setConditionEdit(groupArray)}>
						<div>
							<FontAwesomeIcon icon={faEdit} />
						</div>
					</Button>
					<Button
						variant="light"
						onClick={() => deleteRequisite(groupArray.id)}
					>
						<div>
							<FontAwesomeIcon icon={faTrashCan} />
						</div>
					</Button>
				</Col>
					*/}
			</Row>
		</Container>
	);
};

export default GroupComponent;
