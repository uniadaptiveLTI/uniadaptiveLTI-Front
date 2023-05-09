import { useState } from "react";
import { Modal, Button } from "react-bootstrap";

export default function SimpleActionDialog({
	showDialog,
	toggleDialog,
	type,
	title,
	body,
	action,
	cancel,
	callback,
}) {
	function handleClose(actionClicked) {
		if (callback instanceof Function) {
			callback();
		} else {
			console.warn("Callback isn't a function");
		}
		toggleDialog();
	}
	return (
		<Modal show={showDialog} onHide={toggleDialog}>
			<Modal.Header closeButton>
				<Modal.Title>{title ? title : "Título"}</Modal.Title>
			</Modal.Header>
			<Modal.Body>{body ? body : "Cuerpo del modal"}</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={toggleDialog}>
					{type ? (cancel ? cancel : "Cancelar") : "Cerrar"}
				</Button>
				<Button
					variant={type == "delete" ? "danger" : "primary"}
					onClick={() => handleClose(true)}
				>
					{action ? action : "Ok"}
				</Button>
			</Modal.Footer>
		</Modal>
	);
}
