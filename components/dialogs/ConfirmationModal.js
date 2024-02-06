import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { createFontAwesome } from "@utils/Utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faCircleExclamation,
	faQuestion,
	faTriangleExclamation,
	faWarning,
} from "@fortawesome/free-solid-svg-icons";

const getIcon = (icon) => {
	switch (icon) {
		case "danger":
			return createFontAwesome(faCircleExclamation, "3x", "#dc3545");
		default:
			return createFontAwesome(faQuestion);
	}
};

const ConfirmationModal = (
	{
		show,
		handleClose,
		backdrop,
		title,
		message,
		cancel = "Cancelar",
		confirm,
		confirmVariant = "danger",
		cancelVariant = "primary",
		callbackCancel,
		callbackConfirm,
		icon = "",
	},
	props
) => (
	<Modal
		show={show}
		onHide={handleClose}
		backdrop={backdrop ? "static" : "false"}
	>
		<Modal.Header closeButton>
			<Modal.Title>{title}</Modal.Title>
		</Modal.Header>
		<Modal.Body className={"d-flex flex-row gap-4 align-items-center"}>
			{icon && icon !== "" && <div>{getIcon(icon)}</div>}
			<div>{message}</div>
		</Modal.Body>
		<Modal.Footer>
			<Button
				variant="primary"
				onClick={() => {
					handleClose();
					if (callbackCancel && typeof callbackCancel === "function")
						callbackCancel();
				}}
			>
				{cancel}
			</Button>
			{confirm && confirm.trim() !== "" && (
				<Button
					variant={confirmVariant}
					onClick={() => {
						handleClose();
						if (callbackConfirm && typeof callbackConfirm == "function")
							callbackConfirm();
					}}
				>
					{confirm}
				</Button>
			)}
		</Modal.Footer>
	</Modal>
);

export default ConfirmationModal;
