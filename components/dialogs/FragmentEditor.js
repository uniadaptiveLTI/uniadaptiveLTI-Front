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
	const selectableBlocks =
		mode == "add"
			? orderByLabelAlphabetically(
					reactFlowInstance.getNodes().filter((node) => {
						if (
							node.type == "fragment" ||
							node.type == "start" ||
							node.type == "end" ||
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
	const fragment = getNodeById(id, reactFlowInstance.getNodes());
	const [selectedID, setSelectedID] = useState(selectableBlocks[0]?.id);

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
		const fragment = getNodeById(id, reactFlowInstance.getNodes());
		const newChild = getNodeById(selectedID, reactFlowInstance.getNodes());

		const nodeCenterOffset = { x: 34, y: 34 };
		const fragmentCenter = {
			x: fragment.style.width / 2 - nodeCenterOffset.x,
			y: fragment.style.height / 2 - nodeCenterOffset.y,
		};

		newChild.parentNode = id;
		newChild.expandParent = true;
		newChild.position = { x: fragmentCenter.x, y: fragmentCenter.y };

		console.log(fragment.style);
		if (fragment.style.width <= 68) {
			fragment.style.width = 125;
		}
		if (fragment.style.height <= 68) {
			fragment.style.height = 200;
		}

		fragment.data.innerNodes = [
			...fragment.data.innerNodes,
			{ id: newChild.id, position: newChild.position },
		];
		fragment.zIndex = -1;

		reactFlowInstance.setNodes(
			getUpdatedArrayById(fragment, [
				...reactFlowInstance
					.getNodes()
					.filter((node) => newChild.id != node.id),
				newChild,
			])
		);
	}

	function removeChildren() {
		const fragment = getNodeById(id, reactFlowInstance.getNodes());
		const childToRemove = getNodeById(selectedID, reactFlowInstance.getNodes());
		const bounds = document
			.getElementById("reactFlowWrapper")
			?.getBoundingClientRect();

		const viewPortCenter = reactFlowInstance.project({
			x: bounds.width / 2,
			y: bounds.height / 2,
		});

		delete childToRemove.parentNode;
		delete childToRemove.expandParent;
		childToRemove.position = viewPortCenter;

		fragment.data.innerNodes = fragment.data.innerNodes.filter(
			(node) => node.id != childToRemove.id
		);
		fragment.zIndex = -1;

		reactFlowInstance.setNodes(
			getUpdatedArrayById(fragment, [
				...reactFlowInstance
					.getNodes()
					.filter((node) => childToRemove.id != node.id),
				childToRemove,
			])
		);
	}

	useEffect(() => {
		setSelectedID(selectableBlocks[0].id);
	}, [showDialog]);
	return (
		<Modal show={showDialog} onHide={() => handleClose()}>
			<Modal.Header closeButton>
				<Modal.Title>Editando "{fragment.data.label}"</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form>
					<Form.Label>
						{mode == "add" ? "Añadir" : "Eliminar"} un bloque al fragmento
					</Form.Label>
					<BlockSelector
						size={32}
						nodeArray={selectableBlocks}
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
