import { useId } from "react";
import { Col, Form, Row } from "react-bootstrap";

const GroupForm = ({
	groupsRef,
	blockData,
	sakaiGroups,
	initalGroups,
	setInitalGroups,
	conditionEdit,
}) => {
	const CONDITION_OPERATOR_ID = useId();

	const handleCheckboxChange = (id, index) => {
		const GROUP = groupsRef[index];
		if (GROUP.current.checked == true) {
			setInitalGroups([...initalGroups, { id: id, index: index }]);
		} else {
			const FILTERED_ARRAY = initalGroups.filter((group) => group.id !== id);
			setInitalGroups(FILTERED_ARRAY);
		}
	};

	return (
		<Form.Group
			style={{
				padding: "10px",
				border: "1px solid #C7C7C7",
				marginBottom: "10px",
			}}
			className="d-flex flex-column gap-2 p-4"
		>
			<div className="me-0">
				<Form.Label
					htmlFor={CONDITION_OPERATOR_ID}
					className="me-4"
					style={{ minWidth: "125px" }}
				>
					<b>Grupos: </b>
				</Form.Label>
				{sakaiGroups.length > 0 &&
					sakaiGroups.map((option, index) => {
						const isChecked = conditionEdit?.groupList.some(
							(item) => item.id === option.id
						);

						return (
							<div key={index}>
								<Row style={{ marginBottom: "0.125rem" }}>
									<Col xs="auto">
										<Form.Check
											id={`checkbox-${option.id}`}
											ref={groupsRef[index]}
											onClick={() => handleCheckboxChange(option.id, index)}
											defaultChecked={isChecked}
										/>
									</Col>
									<Col>
										<Form.Label htmlFor={`checkbox-${option.id}`}>
											{option.name}
										</Form.Label>
									</Col>
								</Row>
							</div>
						);
					})}
			</div>
		</Form.Group>
	);
};

export default GroupForm;
