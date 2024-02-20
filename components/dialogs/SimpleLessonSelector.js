import { useRef, useId, useContext } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import LessonSelector from "@components/forms/components/LessonSelector";

export default function SimpleLessonSelector({
	showDialog,
	setShowDialog,
	title = "Selección de Contenido",
	action,
	callback,
	lessons,
}) {
	const selectDOM = useRef(null);

	function handleClose(actionClicked) {
		if (callback && actionClicked) {
			if (callback instanceof Function) {
				if (selectDOM) {
					callback(Number(selectDOM.current.value));
				} else {
					callback();
				}
			} else {
				console.warn("Callback isn't a function");
			}
		}
		setShowDialog(false);
	}
	return (
		<Modal show={showDialog} onHide={() => setShowDialog(false)}>
			<Modal.Header closeButton>
				<Modal.Title>{title}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<LessonSelector lessons={lessons} ref={selectDOM}></LessonSelector>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={() => setShowDialog(false)}>
					Cancelar
				</Button>
				<Button variant={"primary"} onClick={() => handleClose(true)} autoFocus>
					{action ? action : "Ok"}
				</Button>
			</Modal.Footer>
		</Modal>
	);
}
