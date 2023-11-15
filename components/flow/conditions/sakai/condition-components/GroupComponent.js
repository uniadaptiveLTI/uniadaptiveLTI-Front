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
	const GROUP_ARRAY = requisites.find((item) => item.type === "group");

	const SORTED_GROUP_LIST = GROUP_ARRAY.groupList.sort(
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
						{SORTED_GROUP_LIST.map((item, index) => {
							const GROUP = sakaiGroups.find((group) => group.id === item.id);

							return (
								<li key={index}>
									{GROUP ? GROUP.name : "Grupo no encontrado"}
								</li>
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
