import { useRef, useId, useContext } from "react";
import { Modal, Button, Form } from "react-bootstrap";

export default function SimpleLessonSelector({
	showDialog,
	setShowDialog,
	title,
	action,
	callback,
	lessons,
}) {
	const selectDOM = useRef(null);
	const selectLabel = useId();

	function handleClose(actionClicked) {
		if (callback && actionClicked) {
			if (callback instanceof Function) {
				callback();
			} else {
				console.warn("Callback isn't a function");
			}
		}
		setShowDialog(false);
	}
	return (
		<Modal show={showDialog} onHide={() => setShowDialog(false)}>
			<Modal.Header closeButton>
				<Modal.Title>{title ? title : "Selección de Contenido"}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form>
					<Form.Group className="mb-3">
						<Form.Label htmlFor={selectLabel} className="mb-1">
							Seleccione un contenido de los siguientes
						</Form.Label>
						<Form.Select ref={selectDOM} id={selectLabel} className="w-100">
							{lessons &&
								lessons.map((lesson) => (
									<option key={lesson.id} value={lesson.id}>
										{lesson.name}
									</option>
								))}
						</Form.Select>
					</Form.Group>
				</Form>
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
