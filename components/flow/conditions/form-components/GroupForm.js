import React from "react";
import { Form } from "react-bootstrap";

const GroupForm = ({ conditionOperator, moodleGroups, conditionEdit }) => {
	return (
		<Form.Group>
			<Form.Select
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
		</Form.Group>
	);
};

export default GroupForm;
