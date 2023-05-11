import { useCallback, useContext, useState } from "react";
import { NodeResizer, NodeToolbar } from "reactflow";
import { Button } from "react-bootstrap";
import styles from "@components/styles/BlockContainer.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faCubes,
	faExpand,
	faCompress,
	faEdit,
	faUpRightAndDownLeftFromCenter,
	faSquarePlus,
	faSquareMinus,
} from "@fortawesome/free-solid-svg-icons";
import {
	BlockInfoContext,
	BlocksDataContext,
	ExpandedAsideContext,
	MapInfoContext,
	ReactFlowInstanceContext,
	SettingsContext,
	VersionInfoContext,
	notImplemented,
} from "@components/pages/_app";
import { useEffect } from "react";
import {
	getBlockById,
	getBlockByNodeDOM,
	getEdgeBetweenNodeIds,
	getNodeById,
	getNodesByProperty,
	getUpdatedArrayById,
	getUpdatedBlocksDataFromFlow,
} from "@components/components/Utils";
import FocusTrap from "focus-trap-react";

function FragmentNode({ id, xPos, yPos, type, data }) {
	const onChange = useCallback((evt) => {
		//console.log(evt.target.value);
	}, []);

	const { blockSelected, setBlockSelected } = useContext(BlockInfoContext);
	const { mapSelected, setMapSelected } = useContext(MapInfoContext);
	const { selectedEditVersion, setSelectedEditVersion } =
		useContext(VersionInfoContext);
	const { reactFlowInstance } = useContext(ReactFlowInstanceContext);
	const { currentBlocksData, setCurrentBlocksData } =
		useContext(BlocksDataContext);
	const { settings, setSettings } = useContext(SettingsContext);
	const parsedSettings = JSON.parse(settings);
	const { highContrast, showDetails, reducedAnimations } = parsedSettings;
	const [originalChildrenStatus, setOriginalChildrenStatus] = useState(
		data.innerNodes
	);
	const { expandedAside, setExpandedAside } = useContext(ExpandedAsideContext);

	const handleEdit = () => {
		const blockData = {
			id: id,
			x: xPos,
			y: yPos,
			type: type,
			title: data.label,
			children: data.children,
		};
		setExpandedAside(true);
		setSelectedEditVersion("");
		setBlockSelected(blockData);
	};

	const getInnerNodes = () => {
		return getNodesByProperty(reactFlowInstance, "parentNode", id);
	};

	useEffect(() => {
		//Asigns children on creation/render
		const changesArray = [];
		data.innerNodes.map((innerNode) => {
			const node = getNodeById(innerNode.id, reactFlowInstance);
			node.parentNode = id;
			node.expandParent = true; //FIXME: Propiety applies, but it doesn't work
			node.position = innerNode.position;
			changesArray.push(node);
		});
		reactFlowInstance.setNodes(
			getUpdatedArrayById(changesArray, reactFlowInstance.getNodes())
		);
	}, []);

	useEffect(() => {
		const currentInnerNodes = getInnerNodes();

		const style = getNodeById(id, reactFlowInstance).style;

		console.log(data.innerNodes, currentInnerNodes, style);
		if (currentInnerNodes) {
			for (const [index, childNode] of currentInnerNodes.entries()) {
				if (!data.expanded) {
					const newInnerNodes = currentInnerNodes.map((node) => {
						{
							node.hidden = true;
							node.position = { x: 0, y: 0 };
							return node;
						}
					});
					reactFlowInstance.setNodes(
						getUpdatedArrayById(newInnerNodes, reactFlowInstance.getNodes())
					);

					style.width = style.height = 68;
				} else {
					const maxPositions = { x: 0, y: 0 };
					const newInnerNodes = currentInnerNodes.map((node, index) => {
						{
							const nodeX = data.innerNodes[index].position.x;
							const nodeY = data.innerNodes[index].position.y;
							node.hidden = false;
							node.position = {
								x: nodeX,
								y: nodeY,
							};
							maxPositions.x < nodeX ? (maxPositions.x = nodeX) : null;
							maxPositions.y < nodeY ? (maxPositions.y = nodeY) : null;

							return node;
						}
					});

					reactFlowInstance.setNodes(
						getUpdatedArrayById(newInnerNodes, reactFlowInstance.getNodes())
					);

					style.width = maxPositions.x + 68;
					style.height = maxPositions.y + 68;
				}
			}

			for (const childNode1 of currentInnerNodes) {
				const childId1 = childNode1.id;
				for (const childNode2 of currentInnerNodes) {
					const childId2 = childNode2.id;
					const edge = getEdgeBetweenNodeIds(
						childId1,
						childId2,
						reactFlowInstance
					);
					if (edge) {
						//Timeout so the edges get the time to generate
						setTimeout(() => {
							const edgeDOM = document.querySelector(
								"[data-testid=rf__edge-" + edge.id + "]"
							);
							if (edgeDOM) {
								if (!data.expanded) {
									edgeDOM.style.visibility = "hidden";
								} else {
									edgeDOM.style.visibility = "visible";
								}
							}
						}, 10);
					}
				}
			}
		}
	}, [data.expanded]);

	/*const restrictedChildren = (width, height) => {
		const result = originalChildrenStatus.map((children) => {
			let cwidth = children.x;
			let cheight = children.y;

			if (cwidth > width) {
				cwidth = width;
			}
			if (cheight > height) {
				cheight = height;
			}
			return { ...children, x: cwidth, y: cheight };
		});
		return result;
	};

	const handleResizeEnd = (e, p) => {
		const newWidth = p.width - 68;
		const newHeight = p.height - 126;

		const restrictedChildrenArray = restrictedChildren(newWidth, newHeight);

		let updatedChildrenBlockData = [];
		for (const [index, childNode] of originalChildrenStatus.entries()) {
			const newNode = getNodeById(childNode.id, reactFlowInstance);
			newNode.position.x = restrictedChildrenArray[index].x;
			newNode.position.y = restrictedChildrenArray[index].y;

			updatedChildrenBlockData.push({
				id: childNode.id,
				x: restrictedChildrenArray[index].x,
				y: restrictedChildrenArray[index].y,
			});
		}

		const updatedInfo = {
			id: id,
			innerNodes: restrictedChildrenArray,
			style: { width: newWidth, height: newHeight },
		};

		setOriginalChildrenStatus(updatedChildrenBlockData);

		reactFlowInstance.setNodes(
			getUpdatedArrayById(
				[updatedInfo, ...updatedChildrenBlockData],
				reactFlowInstance.getNodes()
			)
		);
	};

	const getCurrentChildrenPositions = () => {
		const children = getInnerNodes();
		const innerNodes = [];
		if (children) {
			for (const childNode of children) {
				const nodeDOM = document.querySelector(
					"[data-id=" + childNode.id + "]"
				);
				const newBlock = getBlockByNodeDOM(
					nodeDOM,
					reactFlowInstance.getNodes()
				);
				const matchingInnerNode = getNodesByProperty(
					reactFlowInstance,
					"parentNode",
					id
				).find((innerNode) => innerNode.id == newBlock.id);
				newBlock.x = matchingInnerNode.position.x;
				newBlock.y = matchingInnerNode.position.y;

				innerNodes.push({
					id: newBlock.id,
					x: newBlock.x,
					y: newBlock.y,
				});
			}
		}
		setOriginalChildrenStatus(innerNodes);
	};*/

	const getAriaLabel = () => {
		let end = "";
		if (data.unit && data.order) {
			end = data.unit
				? ", forma parte de la unidad " +
				  data.unit +
				  ", con la posición " +
				  data.order +
				  "en el LMS."
				: ".";
		}
		return (
			"Fragmento, " +
			data.label +
			", posición en el eje X: " +
			xPos +
			", posición en el eje Y: " +
			yPos +
			end
		);
	};
	return (
		<>
			{data.expanded && (
				<NodeResizer
					minWidth={100}
					minHeight={100}
					/*onResizeStart={getCurrentChildrenPositions}
					onResizeEnd={handleResizeEnd}*/
				/>
			)}
			<NodeToolbar position="left" offset={25}>
				<FocusTrap
					focusTrapOptions={{
						clickOutsideDeactivates: true,
						returnFocusOnDeactivate: true,
					}}
				>
					<div className={styles.blockToolbar}>
						<Button
							variant="dark"
							onClick={() => (data.expanded = !data.expanded)}
						>
							{data.expanded ? (
								<FontAwesomeIcon icon={faCompress} />
							) : (
								<FontAwesomeIcon icon={faExpand} />
							)}
							<span className="visually-hidden">
								{data.expanded ? "Contraer" : "Expandir"} fragmento
							</span>
						</Button>
						<Button variant="dark" onClick={handleEdit}>
							<FontAwesomeIcon icon={faEdit} />
							<span className="visually-hidden">Editar fragmento</span>
						</Button>
						<Button variant="dark" onClick={notImplemented}>
							<FontAwesomeIcon icon={faUpRightAndDownLeftFromCenter} />
							<span className="visually-hidden">Redimensionar fragmento</span>
						</Button>

						<Button variant="dark" onClick={notImplemented}>
							<FontAwesomeIcon icon={faSquarePlus} />
							<span className="visually-hidden">Añadir bloque</span>
						</Button>
						<Button variant="dark" onClick={notImplemented}>
							<FontAwesomeIcon icon={faSquareMinus} />
							<span className="visually-hidden">Eliminar bloque</span>
						</Button>
					</div>
				</FocusTrap>
			</NodeToolbar>
			<div
				id={id}
				className={
					"block " +
					styles.container +
					" " +
					(highContrast && styles.highContrast + " highContrast ") +
					" " +
					(reducedAnimations && styles.noAnimation + " noAnimation") +
					" " +
					(data.expanded && "expandedFragment")
				}
				/*onClick={(e) => {
					if (e.detail === 1)
						if (e.detail === 2)
							handleClick();
							handleDoubleClick();
				}}*/
				aria-label={getAriaLabel} //FIXME: Doesn't work
			>
				{!data.expanded && (
					<span className={styles.blockInfo + " " + styles.top}>
						{data.label}
					</span>
				)}
				<div>
					<FontAwesomeIcon icon={faCubes} />
				</div>
				{!data.expanded && (
					<span className={styles.blockInfo + " " + styles.bottom}>
						Fragmento
					</span>
				)}
			</div>
		</>
	);
}

export default FragmentNode;
