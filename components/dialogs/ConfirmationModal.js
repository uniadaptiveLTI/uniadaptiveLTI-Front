import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

const ConfirmationModal = ({
	show,
	handleClose,
	title,
	message,
	action = "Aceptar",
	callback,
}) => (
	<Modal show={show} onHide={handleClose} backdrop="static">
		<Modal.Header closeButton>
			<Modal.Title>{title}</Modal.Title>
		</Modal.Header>
		<Modal.Body>{message}</Modal.Body>
		<Modal.Footer>
			<Button
				variant="primary"
				onClick={() => {
					handleClose();
					if (callback && typeof callback === "function") callback();
				}}
			>
				{action}
			</Button>
		</Modal.Footer>
	</Modal>
);

export default ConfirmationModal;
