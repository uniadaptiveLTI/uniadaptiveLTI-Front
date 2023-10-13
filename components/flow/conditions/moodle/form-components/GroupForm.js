import React, { useId } from "react";
import { Form } from "react-bootstrap";

const GroupForm = ({ conditionOperator, moodleGroups, conditionEdit }) => {
	const coId = useId();
	return (
		<Form.Group
			style={{
				padding: "10px",
				border: "1px solid #C7C7C7",
				marginBottom: "10px",
			}}
			className="d-flex flex-column gap-2 p-4"
		>
			<div className="d-flex align-items-baseline col-12 col-lg-6 col-xl-4">
				<Form.Label
					htmlFor={coId}
					className="me-4"
					style={{ minWidth: "125px" }}
				>
					Grupo:{" "}
				</Form.Label>
				<Form.Select
					id={coId}
					ref={conditionOperator}
					defaultValue={conditionEdit?.groupId}
				>
					<option value="anyGroup">Cualquier grupo</option>
					{moodleGroups.map((group) => (
						<option value={group.id} key={group.id}>
							{group.name}
						</option>
					))}
				</Form.Select>
			</div>
		</Form.Group>
	);
};

export default GroupForm;
