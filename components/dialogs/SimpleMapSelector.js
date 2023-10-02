import { useState, useRef, useId, useContext } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { MapInfoContext } from "/pages/_app";

export default function SimpleMapSelector({
	showDialog,
	toggleDialog,
	title,
	action,
	callback,
	maps,
	selectedVersion,
}) {
	const selectDOM = useRef(null);
	const selectLabel = useId();
	const { mapSelected, setMapSelected } = useContext(MapInfoContext);

	function handleClose(actionClicked) {
		if (callback && actionClicked) {
			if (callback instanceof Function) {
				callback(selectedVersion, selectDOM.current.value);
			} else {
				console.warn("Callback isn't a function");
			}
		}
		toggleDialog();
	}
	return (
		<Modal show={showDialog} onHide={toggleDialog}>
			<Modal.Header closeButton>
				<Modal.Title>{title ? title : "Selección del mapa"}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form>
					<Form.Group className="mb-3">
						<Form.Label htmlFor={selectLabel} className="mb-1">
							Seleccione un mapa de los siguientes
						</Form.Label>
						<Form.Select
							ref={selectDOM}
							id={selectLabel}
							className="w-100"
							defaultValue={mapSelected.id}
						>
							{maps &&
								maps
									.filter((map) => map.id > -1)
									.map((map) => (
										<option key={map.id} value={map.id}>
											{map.name}
										</option>
									))}
						</Form.Select>
					</Form.Group>
				</Form>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={toggleDialog}>
					Cancelar
				</Button>
				<Button variant={"primary"} onClick={() => handleClose(true)} autoFocus>
					{action ? action : "Ok"}
				</Button>
			</Modal.Footer>
		</Modal>
	);
}
