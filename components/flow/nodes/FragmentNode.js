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
	const [expanded, setExpanded] = useState(data.expanded);

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

	const handleDoubleClick = () => {
		data.expanded = !expanded;
		setExpanded(!expanded);
	};

	const findChildren = () => {
		return getNodesByProperty(reactFlowInstance, "parentNode", id);
	};

	useEffect(() => {
		getCurrentChildrenPositions();
		const children = findChildren();

		if (children) {
			for (const [index, childNode] of children.entries()) {
				const nodeDOM = document.querySelector(
					"[data-id=" + childNode.id + "]"
				);
				const blockContainer = nodeDOM.getElementsByClassName("block")[0];
				blockContainer.classList.add("insideFragment");

				if (!expanded) {
					nodeDOM.classList.add("insideContractedFragment");
					const newBlock = getBlockByNodeDOM(
						nodeDOM,
						reactFlowInstance.getNodes()
					);
					newBlock.x = 0;
					newBlock.y = 0;
					reactFlowInstance.setNodes(
						getUpdatedArrayById(newBlock, reactFlowInstance.getNodes())
					);
				} else {
					nodeDOM.classList.remove("insideContractedFragment");
					const newBlock = getBlockByNodeDOM(
						nodeDOM,
						reactFlowInstance.getNodes()
					);
					const matchingInnerNode = originalChildrenStatus.find(
						(innerNode) => innerNode.id == newBlock.id
					);
					newBlock.x = matchingInnerNode.x;
					newBlock.y = matchingInnerNode.y;
					reactFlowInstance.setNodes(
						getUpdatedArrayById(newBlock, reactFlowInstance.getNodes())
					);
				}
			}

			for (const childNode1 of children) {
				const childId1 = childNode1.id;
				for (const childNode2 of children) {
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
								if (!expanded) {
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
	}, [expanded]);

	const restrictedChildren = (width, height) => {
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

		//console.log([updatedInfo, ...updatedChildrenBlockData]);

		setOriginalChildrenStatus(updatedChildrenBlockData);

		reactFlowInstance.setNodes(
			getUpdatedArrayById(
				[updatedInfo, ...updatedChildrenBlockData],
				reactFlowInstance.getNodes()
			)
		);
	};

	const getCurrentChildrenPositions = () => {
		const children = findChildren();
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
	};

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
			{expanded && (
				<NodeResizer
					minWidth={136}
					minHeight={194}
					onResizeStart={getCurrentChildrenPositions}
					onResizeEnd={handleResizeEnd}
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
						<Button variant="dark" onClick={() => setExpanded(!expanded)}>
							{expanded ? (
								<FontAwesomeIcon icon={faCompress} />
							) : (
								<FontAwesomeIcon icon={faExpand} />
							)}
							<span className="visually-hidden">
								{expanded ? "Contraer" : "Expandir"} fragmento
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
					(expanded && "expandedFragment")
				}
				/*onClick={(e) => {
					if (e.detail === 1)
						if (e.detail === 2)
							handleClick();
							handleDoubleClick();
				}}*/
				aria-label={getAriaLabel} //FIXME: Doesn't work
				style={
					expanded
						? {
								height: data.style.height + 122,
								width: data.style.width + 64,
						  }
						: {}
				}
			>
				{!expanded && (
					<span className={styles.blockInfo + " " + styles.top}>
						{data.label}
					</span>
				)}
				<div>
					<FontAwesomeIcon icon={faCubes} />
				</div>
				{!expanded && (
					<span className={styles.blockInfo + " " + styles.bottom}>
						Fragmento
					</span>
				)}
			</div>
		</>
	);
}

export default FragmentNode;
