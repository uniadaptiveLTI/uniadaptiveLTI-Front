import React, { useState } from "react";
import { Col, Button } from "react-bootstrap";
import styles from "/styles/ConditionModalMoodle.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faArrowDown,
	faArrowUp,
	faCode,
	faEdit,
	faEye,
	faEyeSlash,
	faPlus,
	faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import ConfirmationModal from "../../../../../dialogs/ConfirmationModal";
import { createFontAwesome } from "@utils/Utils";
import ButtonComponent from "@common_components/ButtonComponent";

const ConditionUtilsColumn = ({
	condition,
	conditionsList,
	setConditionEdit,
	upCondition,
	downCondition,
	deleteCondition,
	addCondition,
}) => {
	const getButtonsByType = (type) => {
		switch (type) {
			case "profile":
			case "grouping":
			case "group":
			case "grade":
			case "courseGrade":
			case "date":
			case "completion":
				return (
					<>
						<ButtonComponent
							body={createFontAwesome(faEdit)}
							callback={() => setConditionEdit(condition)}
						></ButtonComponent>
						<ButtonComponent
							body={createFontAwesome(faTrashCan)}
							callback={() => deleteCondition(condition.id)}
						></ButtonComponent>
						{conditionsList.c.length >= 1 && (
							<>
								<ButtonComponent
									body={createFontAwesome(faArrowUp)}
									callback={() => upCondition(condition)}
								></ButtonComponent>
								<ButtonComponent
									body={createFontAwesome(faArrowDown)}
									callback={() => downCondition(condition)}
								></ButtonComponent>
							</>
						)}
					</>
				);
			case "conditionsGroup":
				return (
					<>
						<ButtonComponent
							body={createFontAwesome(faPlus)}
							callback={() => addCondition(condition.id)}
						></ButtonComponent>
						<ButtonComponent
							body={createFontAwesome(faEdit)}
							callback={() => setConditionEdit(condition)}
						></ButtonComponent>
						<ButtonComponent
							body={createFontAwesome(faTrashCan)}
							callback={() => deleteCondition(condition.id)}
						></ButtonComponent>
					</>
				);
			case "generic":
				const [showConditionCodeModal, setShowConditionCodeModal] =
					useState(false);
				const [showConditionDeleteModal, setShowConditionDeleteModal] =
					useState(false);

				const handleConditionCode = (key) => {
					if (key == undefined || key == "Enter" || key == "NumpadEnter") {
						setShowConditionCodeModal(true);
					}
				};

				const handleConditionDelete = (key) => {
					if (key == undefined || key == "Enter" || key == "NumpadEnter") {
						setShowConditionDeleteModal(true);
					}
				};

				return (
					<>
						<ButtonComponent
							body={createFontAwesome(faCode)}
							callback={() => handleConditionCode()}
						></ButtonComponent>
						<ButtonComponent
							body={createFontAwesome(faTrashCan)}
							callback={() => handleConditionDelete()}
						></ButtonComponent>
						{conditionsList.c.length >= 1 && (
							<>
								<ButtonComponent
									body={createFontAwesome(faArrowUp)}
									callback={() => upCondition(condition)}
								></ButtonComponent>
								<ButtonComponent
									body={createFontAwesome(faArrowDown)}
									callback={() => downCondition(condition)}
								></ButtonComponent>
							</>
						)}
						{(showConditionCodeModal || showConditionDeleteModal) && (
							<div className={styles.overlay}></div>
						)}
						{showConditionCodeModal && (
							<ConfirmationModal
								show={showConditionCodeModal}
								handleClose={setShowConditionCodeModal}
								title="Código interno de la condición"
								message={JSON.stringify(condition?.data)}
							/>
						)}
						{showConditionDeleteModal && (
							<ConfirmationModal
								show={showConditionDeleteModal}
								handleClose={setShowConditionDeleteModal}
								backdrop={true}
								title="Confirmación de eliminación de condición"
								message="¿ Desea eliminar la condición ? Esta no se podrá volver a crear debido a que es una condición no soportada"
								confirm="Confirmar"
								callbackConfirm={() => deleteCondition(condition.id)}
								icon="danger"
							/>
						)}
					</>
				);
			default:
				return null;
		}
	};

	const buttons = getButtonsByType(condition.type);

	return (
		<Col className="col d-flex align-items-center justify-content-end gap-2">
			{buttons}
		</Col>
	);
};

export default ConditionUtilsColumn;
