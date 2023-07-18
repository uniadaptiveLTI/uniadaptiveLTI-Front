import React, { useId } from "react";
import { Form } from "react-bootstrap";

const GroupForm = ({ conditionOperator, moodleGroups, conditionEdit }) => {
	const coId = useId();
	return (
		<Form.Group className="d-flex flex-column gap-2 m-4 me-0">
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
					{moodleGroups.length > 0 &&
						moodleGroups.map((group) => (
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
