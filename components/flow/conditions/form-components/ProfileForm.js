import React from "react";
import { Form } from "react-bootstrap";

function ProfileForm({
	conditionOperator,
	conditionQuery,
	conditionObjective,
	conditionEdit,
	handleProfileChange,
}) {
	return (
		<Form.Group>
			<Form.Select ref={conditionQuery} defaultValue={conditionEdit?.sf}>
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
			<Form.Select ref={conditionOperator} defaultValue={conditionEdit?.op}>
				<option value="isequalto">es igual a</option>
				<option value="contains">contiene</option>
				<option value="doesnotcontain">no contiene</option>
				<option value="startswith">comienza con</option>
				<option value="endswith">termina en</option>
				<option value="isempty">está vacío</option>
				<option value="isnotempty">no está vacío</option>
			</Form.Select>
			<Form.Control
				ref={conditionObjective}
				onChange={handleProfileChange}
				defaultValue={conditionEdit?.type === "profile" ? conditionEdit?.v : ""}
				type="text"
			/>
		</Form.Group>
	);
}

export default ProfileForm;
