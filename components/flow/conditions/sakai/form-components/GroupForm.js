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
	const coId = useId();

	const handleCheckboxChange = (id, e, index) => {
		if (e.current.checked == true) {
			setInitalGroups([...initalGroups, id]);
		} else {
			const filteredArray = initalGroups.filter((group) => group !== id);
			setInitalGroups(filteredArray);
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
					htmlFor={coId}
					className="me-4"
					style={{ minWidth: "125px" }}
				>
					<b>Grupos: </b>
				</Form.Label>
				{sakaiGroups.length > 0 &&
					sakaiGroups.map((option, index) => {
						const isChecked = conditionEdit?.groupList.includes(option.id);

						return (
							<div key={index}>
								<Row style={{ marginBottom: "0.125rem" }}>
									<Col xs="auto">
										<Form.Check
											id={`checkbox-${option.id}`}
											ref={groupsRef[index]}
											onClick={() =>
												handleCheckboxChange(option.id, groupsRef[index])
											}
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
