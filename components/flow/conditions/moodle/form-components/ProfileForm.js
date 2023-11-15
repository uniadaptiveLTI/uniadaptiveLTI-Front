import React, { useEffect, useState, useId } from "react";
import { Form } from "react-bootstrap";

function ProfileForm({
	conditionOperator,
	conditionQuery,
	conditionObjective,
	conditionEdit,
	handleProfileChange,
	operatorChange,
	setOperatorChange,
	setProfileObjective,
}) {
	useEffect(() => {
		if (conditionEdit) {
			setOperatorChange(conditionEdit.op);
		}
	}, [conditionEdit]);

	useEffect(() => {
		if (conditionEdit) {
			setOperatorChange(conditionEdit.op);
		}
	}, [conditionEdit]);

	const CONDITION_QUERY_ID = useId();
	const CONDITION_OPERATOR_ID = useId();
	const CONDITION_SEARCH_ID = useId();
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
					htmlFor={CONDITION_QUERY_ID}
					className="me-4"
					style={{ minWidth: "125px" }}
				>
					Condición:{" "}
				</Form.Label>
				<Form.Select
					id={CONDITION_QUERY_ID}
					ref={conditionQuery}
					defaultValue={conditionEdit?.sf}
				>
					<option value="firstname">Nombre</option>
					<option value="lastname">Apellido</option>
					<option value="city">Ciudad</option>
					<option value="department">Departamento</option>
					<option value="address">Dirección</option>
					<option value="email">Dirección de correo</option>
					<option value="institution">Institución</option>
					<option value="idnumber">Número de ID</option>
					<option value="country">País</option>
					<option value="phone1">Teléfono</option>
					<option value="phone2">Teléfono Movil</option>
				</Form.Select>
			</div>
			<div className="d-flex align-items-baseline col-12 col-lg-6 col-xl-4">
				<Form.Label
					htmlFor={CONDITION_OPERATOR_ID}
					className="me-4"
					style={{ minWidth: "125px" }}
				>
					Operación:{" "}
				</Form.Label>
				<Form.Select
					id={CONDITION_OPERATOR_ID}
					ref={conditionOperator}
					defaultValue={conditionEdit?.op}
				>
					<option value="isequalto">es igual a</option>
					<option value="contains">contiene</option>
					<option value="doesnotcontain">no contiene</option>
					<option value="startswith">comienza con</option>
					<option value="endswith">termina en</option>
					<option value="isempty">está vacío</option>
					<option value="isnotempty">no está vacío</option>
				</Form.Select>
			</div>
			<div className="d-flex align-items-baseline col-12 col-lg-6 col-xl-4">
				<Form.Label
					htmlFor={CONDITION_SEARCH_ID}
					className="me-4"
					style={{ minWidth: "125px" }}
				>
					Búsqueda:{" "}
				</Form.Label>
				<Form.Control
					id={CONDITION_SEARCH_ID}
					ref={conditionObjective}
					onChange={handleProfileChange}
					defaultValue={
						conditionEdit?.type === "profile" ? conditionEdit?.v : ""
					}
					type="text"
				/>
			</div>
		</Form.Group>
	);
}

export default ProfileForm;
