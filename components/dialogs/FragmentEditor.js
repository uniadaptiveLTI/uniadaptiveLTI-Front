import { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { getNodeById, orderByLabelAlphabetically } from "@utils/Nodes";
import { getUpdatedArrayById } from "@utils/Utils";
import { useReactFlow } from "reactflow";
import BlockSelector from "../forms/components/BlockSelector";

export default function FragmentEditor({
	showDialog,
	setShowEditor,
	mode = "add",
	id,
}) {
	const reactFlowInstance = useReactFlow();
	const SELECTABLE_BLOCKS =
		mode == "add"
			? orderByLabelAlphabetically(
					reactFlowInstance.getNodes().filter((node) => {
						if (
							node.type == "fragment" ||
							node.id == id ||
							node.parentNode != undefined
						) {
							return false;
						} else {
							return true;
						}
					})
			  )
			: orderByLabelAlphabetically(
					reactFlowInstance.getNodes().filter((node) => node.parentNode == id)
			  );
	const FRAGMENT = getNodeById(id, reactFlowInstance.getNodes());
	const [selectedID, setSelectedID] = useState(SELECTABLE_BLOCKS[0]?.id);

	function handleClose(actionClicked) {
		if (actionClicked) {
			switch (mode) {
				case "add":
					addNewChildren();
					break;
				case "remove":
					removeChildren();
					break;
				default:
					console.warn("Editor mode not supported");
			}
		}
		setShowEditor(false);
	}

	function addNewChildren() {
		const FRAGMENT = getNodeById(id, reactFlowInstance.getNodes());
		const NEW_CHILD = getNodeById(selectedID, reactFlowInstance.getNodes());

		const nodeCenterOffset = { x: 34, y: 34 };
		const fragmentCenter = {
			x: FRAGMENT.style.width / 2 - nodeCenterOffset.x,
			y: FRAGMENT.style.height / 2 - nodeCenterOffset.y,
		};

		NEW_CHILD.parentNode = id;
		NEW_CHILD.expandParent = true;
		NEW_CHILD.position = { x: fragmentCenter.x, y: fragmentCenter.y };

		if (FRAGMENT.style.width <= 68) {
			FRAGMENT.style.width = 125;
		}
		if (FRAGMENT.style.height <= 68) {
			FRAGMENT.style.height = 200;
		}

		FRAGMENT.data.innerNodes = [
			...FRAGMENT.data.innerNodes,
			{ id: NEW_CHILD.id, position: NEW_CHILD.position },
		];
		FRAGMENT.zIndex = -1;

		reactFlowInstance.setNodes(
			getUpdatedArrayById(FRAGMENT, [
				...reactFlowInstance
					.getNodes()
					.filter((node) => NEW_CHILD.id != node.id),
				NEW_CHILD,
			])
		);
	}

	function removeChildren() {
		const FRAGMENT = getNodeById(id, reactFlowInstance.getNodes());
		const CHILD_TO_REMOVE = getNodeById(
			selectedID,
			reactFlowInstance.getNodes()
		);
		const BOUNDS = document
			.getElementById("reactFlowWrapper")
			?.getBoundingClientRect();

		const viewPortCenter = reactFlowInstance.project({
			x: BOUNDS.width / 2,
			y: BOUNDS.height / 2,
		});

		delete CHILD_TO_REMOVE.parentNode;
		delete CHILD_TO_REMOVE.expandParent;
		CHILD_TO_REMOVE.position = viewPortCenter;

		FRAGMENT.data.innerNodes = FRAGMENT.data.innerNodes.filter(
			(node) => node.id != CHILD_TO_REMOVE.id
		);
		FRAGMENT.zIndex = -1;

		reactFlowInstance.setNodes(
			getUpdatedArrayById(FRAGMENT, [
				...reactFlowInstance
					.getNodes()
					.filter((node) => CHILD_TO_REMOVE.id != node.id),
				CHILD_TO_REMOVE,
			])
		);
	}

	useEffect(() => {
		setSelectedID(SELECTABLE_BLOCKS[0].id);
	}, [showDialog]);
	return (
		<Modal show={showDialog} onHide={() => handleClose()}>
			<Modal.Header closeButton>
				<Modal.Title>Editando "{FRAGMENT.data.label}"</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form>
					<Form.Label>
						{mode == "add" ? "Añadir" : "Eliminar"} un bloque al fragmento
					</Form.Label>
					<BlockSelector
						size={32}
						nodeArray={SELECTABLE_BLOCKS}
						onChange={(e) => setSelectedID(e.target.value)}
						autoFocus
					></BlockSelector>
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
