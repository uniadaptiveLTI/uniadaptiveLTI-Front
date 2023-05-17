import { useContext, useState, useRef, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { getNodeById } from "../Utils";
import { useReactFlow } from "reactflow";
import BlockSelector from "../forms/components/BlockSelector";

export default function FragmentAdder({
	showDialog,
	setShowAdder,
	id,
	callback,
}) {
	const reactFlowInstance = useReactFlow();
	const fragment = getNodeById(id, reactFlowInstance);

	function handleClose(actionClicked) {
		if (callback && actionClicked) {
			if (callback instanceof Function) {
				callback();
			} else {
				console.warn("Callback isn't a function");
			}
		}
		setShowAdder(false);
	}
	return (
		<Modal show={showDialog} onHide={() => handleClose()}>
			<Modal.Header closeButton>
				<Modal.Title>Editando "{fragment.data.label}"</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form>
					<Form.Label>Añadir un bloque al fragmento</Form.Label>
					<BlockSelector size={128}></BlockSelector>
				</Form>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={() => handleClose()}>
					Cancelar
				</Button>
				<Button variant="primary" onClick={() => handleClose(true)}>
					Añadir
				</Button>
			</Modal.Footer>
		</Modal>
	);
}
