import { useContext, useState, useRef, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { getNodeById } from "../Utils";
import { useReactFlow } from "reactflow";
import { SettingsContext } from "@components/pages/_app";

export default function FragmentResizer({
	showDialog,
	setShowResizer,
	id,
	callback,
}) {
	const reactFlowInstance = useReactFlow();
	const fragment = getNodeById(id, reactFlowInstance);
	const { settings, setSettings } = useContext(SettingsContext);
	const parsedSettings = JSON.parse(settings);
	const { snappingInFragment } = parsedSettings;
	const [width, setWidth] = useState(Math.ceil(fragment.style.width / 125));
	const [height, setHeight] = useState(Math.ceil(fragment.style.height / 175));
	const maxWidth = 25;
	const maxHeight = 5;
	const widthControl = useRef(null);
	const heightControl = useRef(null);
	function handleClose(actionClicked) {
		if (callback && actionClicked) {
			if (callback instanceof Function) {
				callback(Math.min(height, maxHeight), Math.min(width, maxWidth));
			} else {
				console.warn("Callback isn't a function");
			}
		}
		setShowResizer(false);
	}

	useEffect(() => {
		if (widthControl.value > maxWidth) {
			widthControl.value = maxWidth;
		}

		if (heightControl.value > maxHeight) {
			heightControl.value = maxHeight;
		}
	}, [widthControl.value, heightControl.value]);

	useEffect(() => {
		setWidth(Math.ceil(fragment.style.width / 125));
		setHeight(Math.ceil(fragment.style.height / 175));
		if (widthControl.current && heightControl.current) {
			widthControl.current.value = Math.ceil(fragment.style.width / 125);
			heightControl.current.value = Math.ceil(fragment.style.height / 175);
		}
	}, [showDialog]);
	return (
		<Modal show={showDialog} onHide={() => handleClose()}>
			<Modal.Header closeButton>
				<Modal.Title>Redimensionando "{fragment.data.label}"</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form>
					<div>
						<div>
							Verticalmente podrá contener{" "}
							{!snappingInFragment && "aproximadamente"}
							<Form.Control
								ref={heightControl}
								defaultValue={height}
								type="number"
								min={1}
								max={maxHeight}
								onChange={(e) => setHeight(e.target.value)}
								onInput={(e) =>
									(e.target.value = Math.min(e.target.value, maxHeight))
								}
								style={{ display: "inline-block", maxWidth: "4em" }}
							/>{" "}
							bloques.
						</div>
						<div>
							Horizontalmente podrá contener{" "}
							{!snappingInFragment && "aproximadamente"}
							<Form.Control
								ref={widthControl}
								defaultValue={width}
								type="number"
								min={1}
								max={maxWidth}
								onChange={(e) => setWidth(e.target.value)}
								onInput={(e) =>
									(e.target.value = Math.min(e.target.value, maxWidth))
								}
								style={{ display: "inline-block", maxWidth: "4em" }}
							/>{" "}
							bloques.
						</div>
					</div>
					<Form.Text>
						Dimensiones finales: {height} x {width}
					</Form.Text>
				</Form>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={() => handleClose()}>
					Cancelar
				</Button>
				<Button variant="primary" onClick={() => handleClose(true)}>
					Redimensionar
				</Button>
			</Modal.Footer>
		</Modal>
	);
}
