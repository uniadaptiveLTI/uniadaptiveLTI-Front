import React, { useId } from "react";
import { Form } from "react-bootstrap";

const DateExceptionComponent = ({
	onCheckboxChange,
	openingDateRef,
	dueDateRef,
	exceptionSelectRef,
	exceptionEntityRef,
	setDates,
	requisiteEdit,
	exceptionSelected,
	setExceptionSelected,
	sakaiGroups,
	sakaiUsers,
}) => {
	const cqId = useId();
	const coId = useId();

	const handleCheckbox1Change = (e) => {
		if (!e.target.checked) {
			openingDateRef.current.disabled = true;
		} else {
			openingDateRef.current.disabled = false;
		}

		onCheckboxChange("openingDate", e.target.checked, openingDateRef);
	};

	const handleCheckbox2Change = (e) => {
		if (!e.target.checked) {
			dueDateRef.current.disabled = true;
		} else {
			dueDateRef.current.disabled = false;
		}
		onCheckboxChange("dueDate", e.target.checked, dueDateRef);
	};

	const dateInputChange = (paramName, ref) => {
		setDates((prevDates) => {
			if (prevDates && prevDates[paramName] !== undefined) {
				return {
					...prevDates,
					[paramName]: ref.current.value,
				};
			}
			return prevDates;
		});
	};

	const selectExceptionChange = (ref) => {
		setExceptionSelected(ref.current.value);
	};

	return (
		<>
			<div className="d-flex align-items-baseline col-12 col-lg-6 col-xl-6">
				<Form.Select
					ref={exceptionSelectRef}
					onChange={() => {
						selectExceptionChange(exceptionSelectRef);
					}}
				>
					<option value="user">Usuario</option>
					<option value="group">Grupo</option>
				</Form.Select>
			</div>
			<div className="d-flex align-items-baseline col-12 col-lg-6 col-xl-6">
				<Form.Select ref={exceptionEntityRef}>
					{!exceptionSelected ||
						(exceptionSelected === "user" &&
							sakaiUsers.map((user) => (
								<option key={user.id} value={user.id}>
									{user.name}
								</option>
							)))}
					{exceptionSelected === "group" &&
						sakaiGroups.map((group) => (
							<option key={group.id} value={group.id}>
								{group.name}
							</option>
						))}
				</Form.Select>
			</div>
			<div className="d-flex align-items-baseline col-12 col-lg-6 col-xl-6">
				<Form.Check
					id="objectiveCheckbox"
					type="checkbox"
					onChange={handleCheckbox1Change}
				/>
				<Form.Label
					htmlFor={cqId}
					className="me-4"
					style={{ minWidth: "125px", marginLeft: "20px" }}
				>
					Desde:{" "}
				</Form.Label>
				<Form.Control
					id={cqId}
					ref={openingDateRef}
					onChange={() => {
						dateInputChange("openingDate", openingDateRef);
					}}
					// FIXME: CHANGE TO SERVER DATE TIME
					defaultValue={
						requisiteEdit
							? requisiteEdit
							: new Date().toISOString().slice(0, 16)
					}
					type="datetime-local"
					disabled
				/>
			</div>
			<div className="d-flex align-items-baseline col-12 col-lg-6 col-xl-6">
				<Form.Check
					id="objectiveCheckbox"
					type="checkbox"
					onChange={handleCheckbox2Change}
				/>
				<Form.Label
					htmlFor={coId}
					className="me-4"
					style={{ minWidth: "125px", marginLeft: "20px" }}
				>
					Hasta:{" "}
				</Form.Label>
				<Form.Control
					id={coId}
					ref={dueDateRef}
					type="datetime-local"
					onChange={() => {
						dateInputChange("dueDate", dueDateRef);
					}}
					defaultValue={
						requisiteEdit
							? requisiteEdit
							: new Date().toISOString().substr(0, 16)
					}
					disabled
				/>
			</div>
		</>
	);
};

export default DateExceptionComponent;
