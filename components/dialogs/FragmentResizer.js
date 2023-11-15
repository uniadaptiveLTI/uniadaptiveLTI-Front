import { useContext, useState, useRef, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { getNodeById } from "@utils/Nodes";
import { useReactFlow, useNodes } from "reactflow";
import { SettingsContext } from "/pages/_app";

export default function FragmentResizer({
	showDialog,
	setShowResizer,
	id,
	callback,
}) {
	const reactFlowInstance = useReactFlow();
	const rfNodes = useNodes();
	const fragment = getNodeById(id, rfNodes);
	const { settings, setSettings } = useContext(SettingsContext);
	const PARSED_SETTINGS = JSON.parse(settings);
	const { snappingInFragment } = PARSED_SETTINGS;
	const [width, setWidth] = useState(Math.ceil(fragment.style.width / 125));
	const [height, setHeight] = useState(Math.ceil(fragment.style.height / 225));
	const MAX_WIDTH = 25;
	const MAX_HEIGHT = 5;
	const WIDTH_CONTROL = useRef(null);
	const HEIGHT_CONTROL = useRef(null);
	function handleClose(actionClicked) {
		if (callback && actionClicked) {
			if (callback instanceof Function) {
				callback(Math.min(height, MAX_HEIGHT), Math.min(width, MAX_WIDTH));
				reactFlowInstance.fitView();
			} else {
				console.warn("Callback isn't a function");
			}
		}
		setShowResizer(false);
	}

	useEffect(() => {
		if (WIDTH_CONTROL.value > MAX_WIDTH) {
			WIDTH_CONTROL.value = MAX_WIDTH;
		}

		if (HEIGHT_CONTROL.value > MAX_HEIGHT) {
			HEIGHT_CONTROL.value = MAX_HEIGHT;
		}
	}, [WIDTH_CONTROL.value, HEIGHT_CONTROL.value]);

	useEffect(() => {
		setWidth(Math.ceil(fragment.style.width / 125));
		setHeight(Math.ceil(fragment.style.height / 200));
		if (WIDTH_CONTROL.current && HEIGHT_CONTROL.current) {
			WIDTH_CONTROL.current.value = Math.ceil(fragment.style.width / 125);
			HEIGHT_CONTROL.current.value = Math.ceil(fragment.style.height / 225);
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
							Contendrá{" "}
							<Form.Control
								ref={WIDTH_CONTROL}
								defaultValue={width}
								type="number"
								min={1}
								max={MAX_WIDTH}
								onChange={(e) => setWidth(e.target.value)}
								onInput={(e) =>
									(e.target.value = Math.min(e.target.value, MAX_WIDTH))
								}
								style={{ display: "inline-block", maxWidth: "4em" }}
							/>{" "}
							bloques horizontales. {!snappingInFragment && "(Aproximadamente)"}
						</div>
						<div>
							Contendrá{" "}
							<Form.Control
								ref={HEIGHT_CONTROL}
								defaultValue={height}
								type="number"
								min={1}
								max={MAX_HEIGHT}
								onChange={(e) => setHeight(e.target.value)}
								onInput={(e) =>
									(e.target.value = Math.min(e.target.value, MAX_HEIGHT))
								}
								style={{ display: "inline-block", maxWidth: "4em" }}
								autoFocus
							/>{" "}
							bloques verticales. {!snappingInFragment && "(Aproximadamente)"}
						</div>
					</div>
					<Form.Text>
						Dimensiones finales: {width} x {height}
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
