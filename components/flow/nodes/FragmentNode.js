import {
	useCallback,
	useContext,
	useState,
	useEffect,
	useLayoutEffect,
} from "react";
import { NodeResizer, NodeToolbar, useReactFlow, useEdges } from "reactflow";
import { Button } from "react-bootstrap";
import styles from "@components/styles/BlockContainer.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faCubes,
	faExpand,
	faCompress,
	faEdit,
	faUpRightAndDownLeftFromCenter,
	faRightToBracket,
	faRightFromBracket,
	faObjectUngroup,
} from "@fortawesome/free-solid-svg-icons";
import {
	BlockInfoContext,
	BlocksDataContext,
	ExpandedAsideContext,
	MapInfoContext,
	SettingsContext,
	VersionInfoContext,
} from "@components/pages/_app";
import {
	getNodeDOMById,
	getNodeById,
	getByProperty,
	getUpdatedArrayById,
} from "@components/components/Utils";
import FocusTrap from "focus-trap-react";
import FragmentResizer from "@components/components/dialogs/FragmentResizer";
import FragmentEditor from "@components/components/dialogs/FragmentEditor";

function FragmentNode({ id, xPos, yPos, type, data }) {
	const { blockSelected, setBlockSelected } = useContext(BlockInfoContext);
	const { mapSelected, setMapSelected } = useContext(MapInfoContext);
	const { selectedEditVersion, setSelectedEditVersion } =
		useContext(VersionInfoContext);
	const reactFlowInstance = useReactFlow();
	const { settings, setSettings } = useContext(SettingsContext);
	const parsedSettings = JSON.parse(settings);
	const { highContrast, showDetails, reducedAnimations } = parsedSettings;
	const [originalChildrenStatus, setOriginalChildrenStatus] = useState(
		data.innerNodes
	);
	const { expandedAside, setExpandedAside } = useContext(ExpandedAsideContext);
	const [showResizer, setShowResizer] = useState(false);
	const [showEditor, setShowEditor] = useState(false);
	const [editorMode, setEditorMode] = useState("add");
	const [showRemover, setShowRemover] = useState(false);

	const [expanded, setExpanded] = useState(data.expanded);

	const handleEdit = () => {
		const blockData = getNodeById(id, reactFlowInstance.getNodes());
		setExpandedAside(true);
		setSelectedEditVersion("");
		setBlockSelected(blockData);
	};

	const getInnerNodes = () => {
		return getByProperty("parentNode", id, reactFlowInstance.getNodes());
	};

	useLayoutEffect(() => {
		//Asigns children on creation/render
		const changesArray = [];
		data.innerNodes.map((innerNode) => {
			const node = getNodeById(innerNode.id, reactFlowInstance.getNodes());
			if (node) {
				node.parentNode = id;
				node.expandParent = true; //FIXME: Propiety applies, but it doesn't work
				node.position = innerNode.position;
				changesArray.push(node);
			}
		});
		reactFlowInstance.setNodes(
			getUpdatedArrayById(changesArray, reactFlowInstance.getNodes())
		);
	}, []);

	useLayoutEffect(() => {
		const currentInnerNodes = getInnerNodes();
		const currentNode = getNodeById(id, reactFlowInstance.getNodes());
		const styles = currentNode.style
			? currentNode.style
			: { height: 68, width: 68 };

		if (currentInnerNodes) {
			if (!expanded) {
				const newInnerNodes = currentInnerNodes.map((node) => {
					{
						node.position = { x: 0, y: 0 };
						return node;
					}
				});

				const updatedNodes = reactFlowInstance.getNodes().map((node) => {
					const matchingNode = newInnerNodes.find(
						(innerNode) => innerNode.id === node.id
					);
					if (matchingNode) {
						return {
							...node,
							...matchingNode,
						};
					}
					return node;
				});

				styles.width = styles.height = 68;

				reactFlowInstance.setNodes(
					getUpdatedArrayById(
						[...updatedNodes, { ...currentNode, style: styles }],
						reactFlowInstance.getNodes()
					)
				);
			} else {
				const maxPositions = { x: 0, y: 0 };
				const newInnerNodes = currentInnerNodes.map((node, index) => {
					{
						const nodeX = data.innerNodes[index].position.x;
						const nodeY = data.innerNodes[index].position.y;
						node.position = {
							x: nodeX,
							y: nodeY,
						};
						maxPositions.x < nodeX ? (maxPositions.x = nodeX) : null;
						maxPositions.y < nodeY ? (maxPositions.y = nodeY) : null;

						return node;
					}
				});

				const updatedNodes = reactFlowInstance.getNodes().map((node) => {
					const matchingNode = newInnerNodes.find(
						(innerNode) => innerNode.id === node.id
					);
					if (matchingNode) {
						return {
							...node,
							...matchingNode,
						};
					}
					return node;
				});

				styles.width = maxPositions.x + 68;
				styles.height = maxPositions.y + 68;

				reactFlowInstance.setNodes(
					getUpdatedArrayById(
						[...updatedNodes, { ...currentNode, style: styles }],
						reactFlowInstance.getNodes()
					)
				);
			}
		}
	}, [expanded]);

	useEffect(() => {
		if (expanded) {
			getInnerNodes().map(
				(node) => (getNodeDOMById(node.id).style.visibility = "visible")
			);
		} else {
			getInnerNodes().map(
				(node) => (getNodeDOMById(node.id).style.visibility = "hidden")
			);
		}

		reactFlowInstance.setEdges(
			reactFlowInstance.getEdges().map((edge) => {
				if (
					getInnerNodes().some((innerNode) => innerNode.id == edge.source) &&
					getInnerNodes().some((innerNode) => innerNode.id == edge.target)
				) {
					if (expanded) {
						edge.hidden = false;
						return edge;
					} else {
						edge.hidden = true;
						return edge;
					}
				}
				return edge;
			})
		);
	}, [expanded]);

	const restrictedChildren = (width, height) => {
		const result = getInnerNodes().map((children) => {
			let cwidth = children.position.x;
			let cheight = children.position.y;

			if (cwidth > width) {
				cwidth = width;
			}
			if (cheight > height) {
				cheight = height;
			}
			return { id: children.id, position: { x: cwidth, y: cheight } };
		});
		return result;
	};

	const handleResizeEnd = (e, p) => {
		const newWidth = p.width - 68;
		const newHeight = p.height - 126;

		const restrictedChildrenArray = restrictedChildren(newWidth, newHeight);

		const updatedInfo = {
			id: id,
			data: { ...data, innerNodes: restrictedChildrenArray },
		};

		reactFlowInstance.setNodes(
			getUpdatedArrayById(
				[updatedInfo, ...restrictedChildrenArray],
				reactFlowInstance.getNodes()
			)
		);
	};

	const resizeFragment = (height, width) => {
		const currentNode = getNodeById(id, reactFlowInstance.getNodes());
		const style = { height: height * 175, width: width * 125 };
		currentNode.style = style;
		currentNode.height = style.height;
		currentNode.width = style.width;

		const restrictedChildrenArray = restrictedChildren(
			style.width - 125,
			style.height - 175
		);

		let updatedChildrenBlockData = [];
		for (const [index, childNode] of originalChildrenStatus.entries()) {
			const newNode = getNodeById(childNode.id, reactFlowInstance.getNodes());
			newNode.position.x = restrictedChildrenArray[index].position.x;
			newNode.position.y = restrictedChildrenArray[index].position.y;

			updatedChildrenBlockData.push({
				id: childNode.id,
				x: restrictedChildrenArray[index].x,
				y: restrictedChildrenArray[index].y,
			});
		}

		reactFlowInstance.setNodes(
			getUpdatedArrayById(
				[currentNode, ...updatedChildrenBlockData],
				reactFlowInstance.getNodes()
			)
		);
	};

	const dismantleSelf = () => {
		const currentNode = getNodeById(id, reactFlowInstance.getNodes());
		const innerNodes = getInnerNodes();

		const updatedInnerNodes = innerNodes.map((node) => {
			node.parentNode = undefined;
			node.expandParent = false;
			node.position = node.positionAbsolute;
			return node;
		});

		reactFlowInstance.setNodes(
			getUpdatedArrayById(
				updatedInnerNodes,
				reactFlowInstance.getNodes().filter((node) => node.id != id)
			)
		);
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
					minWidth={125}
					minHeight={175}
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
						<Button
							variant="dark"
							onClick={() => {
								data.expanded = !data.expanded;
								setExpanded(!expanded);
							}}
							title={expanded ? "Contraer fragmento" : "Expandir fragmento"}
						>
							{expanded ? (
								<FontAwesomeIcon icon={faCompress} />
							) : (
								<FontAwesomeIcon icon={faExpand} />
							)}
							<span className="visually-hidden">
								{expanded ? "Contraer fragmento" : "Expandir fragmento"}
							</span>
						</Button>
						<Button
							variant="dark"
							onClick={handleEdit}
							title="Editar fragmento"
						>
							<FontAwesomeIcon icon={faEdit} />
							<span className="visually-hidden">Editar fragmento</span>
						</Button>
						{expanded && (
							<>
								<Button
									variant="dark"
									onClick={() => setShowResizer(true)}
									title="Redimensionar fragmento"
								>
									<FontAwesomeIcon icon={faUpRightAndDownLeftFromCenter} />
									<span className="visually-hidden">
										Redimensionar fragmento
									</span>
								</Button>

								{
									//If there is valid nodes outside the fragment
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
									}).length > 0 && (
										<Button
											variant="dark"
											onClick={() => {
												setEditorMode("add");
												setShowEditor(true);
											}}
											title="Añadir bloque"
										>
											<FontAwesomeIcon icon={faRightToBracket} />
											<span className="visually-hidden">Añadir bloque</span>
										</Button>
									)
								}
								{data.innerNodes.length > 0 && (
									<>
										<Button
											variant="dark"
											onClick={() => {
												setEditorMode("remove");
												setShowEditor(true);
											}}
											title="Eliminar bloque"
										>
											<FontAwesomeIcon icon={faRightFromBracket} />
											<span className="visually-hidden">Eliminar bloque</span>
										</Button>
										<Button
											variant="dark"
											onClick={() => {
												dismantleSelf();
											}}
											title="Desagrupar"
										>
											<FontAwesomeIcon icon={faObjectUngroup} />
											<span className="visually-hidden">Desagrupar</span>
										</Button>
									</>
								)}
							</>
						)}
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
			>
				{!expanded && (
					<span className={styles.blockInfo + " " + styles.top}>
						{data.label}
					</span>
				)}
				<div>
					<FontAwesomeIcon icon={faCubes} />
					{expanded && process.env.DEV_MODE && (
						<pre
							style={{
								position: "absolute",
								color: "black",
								fontSize: "0.75em",
							}}
						>
							{JSON.stringify(data.innerNodes, null, " ")}
						</pre>
					)}
				</div>
				{!expanded && (
					<span className={styles.blockInfo + " " + styles.bottom}>
						Fragmento
					</span>
				)}
			</div>
			{showResizer && (
				<FragmentResizer
					showDialog={showResizer}
					setShowResizer={setShowResizer}
					id={id}
					callback={resizeFragment}
				/>
			)}
			{showEditor && (
				<FragmentEditor
					showDialog={showEditor}
					setShowEditor={setShowEditor}
					mode={editorMode}
					id={id}
				/>
			)}
		</>
	);
}

export default FragmentNode;
