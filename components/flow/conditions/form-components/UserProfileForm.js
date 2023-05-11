import React from "react";
import { Form } from "react-bootstrap";

function UserProfileForm({
	conditionOperator,
	conditionQuery,
	conditionObjective,
	conditionEdit,
	handleUserProfileChange,
}) {
	return (
		<Form.Group>
			<Form.Select ref={conditionOperator} defaultValue={conditionEdit?.op}>
				<option value="firstName">Nombre</option>
				<option value="lastName">Apellido</option>
				<option value="city">Ciudad</option>
				<option value="department">Departamento</option>
				<option value="address">Dirección</option>
				<option value="emailAddress">Dirección de correo</option>
				<option value="institution">Institución</option>
				<option value="idNumber">Número de ID</option>
				<option value="country">País</option>
				<option value="telephone">Teléfono</option>
				<option value="mobilePhone">Teléfono Movil</option>
			</Form.Select>
			<Form.Select ref={conditionQuery} defaultValue={conditionEdit?.query}>
				<option value="equals">es igual a</option>
				<option value="contains">contiene</option>
				<option value="notContains">no contiene</option>
				<option value="startsWith">comienza con</option>
				<option value="endsWith">termina en</option>
				<option value="empty">está vacío</option>
				<option value="notEmpty">no está vacío</option>
			</Form.Select>
			<Form.Control
				ref={conditionObjective}
				onChange={handleUserProfileChange}
				defaultValue={
					conditionEdit?.type === "userProfile" ? conditionEdit?.objective : ""
				}
				type="text"
			/>
		</Form.Group>
	);
}

export default UserProfileForm;
