import {
	useCallback,
	useContext,
	useState,
	useEffect,
	useLayoutEffect,
} from "react";
import {
	NodeResizer,
	NodeToolbar,
	useReactFlow,
	useEdges,
	Position,
} from "reactflow";
import { Button } from "react-bootstrap";
import styles from "/styles/BlockContainer.module.css";
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
	EditedNodeContext,
	ExpandedAsideContext,
	MapInfoContext,
	SettingsContext,
	EditedVersionContext,
} from "pages/_app";
import { getByProperty, getUpdatedArrayById, parseBool } from "@utils/Utils";
import { getNodeDOMById, getNodeById } from "@utils/Nodes";
import FocusTrap from "focus-trap-react";
import FragmentResizer from "components/dialogs/FragmentResizer";
import FragmentEditor from "components/dialogs/FragmentEditor";
import { INode } from "@components/interfaces/INode";

function FragmentNode({ id, xPos, yPos, data }) {
	const { nodeSelected, setNodeSelected } = useContext(EditedNodeContext);
	const { mapSelected, setMapSelected } = useContext(MapInfoContext);
	const { editVersionSelected, setEditVersionSelected } =
		useContext(EditedVersionContext);
	const reactFlowInstance = useReactFlow();
	const { settings, setSettings } = useContext(SettingsContext);
	const PARSED_SETTINGS = JSON.parse(settings);
	const { highContrast, showDetails, reducedAnimations } = PARSED_SETTINGS;
	const [originalChildrenStatus, setOriginalChildrenStatus] = useState(
		data.innerNodes
	);
	const { expandedAside, setExpandedAside } = useContext(ExpandedAsideContext);
	const [showResizer, setShowResizer] = useState(false);
	const [showEditor, setShowEditor] = useState(false);
	const [editorMode, setEditorMode] = useState("add");
	const [showRemover, setShowRemover] = useState(false);

	const [expanded, setExpanded] = useState(data.expanded);
	interface size {
		width: number;
		height: number;
	}
	const [originalExpandedSize, setOriginalExpandedSize] = useState<size>();

	const handleEdit = () => {
		const BLOCKDATA = getNodeById(id, reactFlowInstance.getNodes());
		setExpandedAside(true);
		setEditVersionSelected(undefined);
		setNodeSelected(BLOCKDATA);
	};

	const getInnerNodes = () => {
		return getByProperty(
			"parentNode",
			id,
			reactFlowInstance.getNodes()
		) as Array<INode>;
	};

	useLayoutEffect(() => {
		//Asigns children on creation/render
		const CHANGES_ARRAY = [];
		data.innerNodes.map((innerNode) => {
			const NODE = getNodeById(innerNode.id, reactFlowInstance.getNodes());
			if (NODE) {
				NODE.parentNode = id;
				NODE.expandParent = true;
				NODE.position = innerNode.position;
				CHANGES_ARRAY.push(NODE);
			}
		});

		reactFlowInstance.setNodes(
			getUpdatedArrayById(
				CHANGES_ARRAY,
				reactFlowInstance.getNodes()
			) as Array<INode>
		);
	}, []);

	useLayoutEffect(() => {
		//Sets nodes on map load and on following updates
		const CURRENT_INNER_NODES = getInnerNodes();
		const CURRENT_NODE = getNodeById(id, reactFlowInstance.getNodes());
		const STYLES = CURRENT_NODE.style
			? CURRENT_NODE.style
			: { height: 68, width: 68 };

		if (CURRENT_INNER_NODES) {
			if (!expanded) {
				//Moves the position of the invisible blocks on the top of the node
				const NEW_INNER_NODES = CURRENT_INNER_NODES.map((node) => {
					{
						node.position = { x: 0, y: 0 };
						return node;
					}
				});

				const UPDATED_NODES = reactFlowInstance.getNodes().map((node) => {
					const MATCHING_NODE = NEW_INNER_NODES.find(
						(innerNode) => innerNode.id === node.id
					);
					if (MATCHING_NODE) {
						return {
							...node,
							...MATCHING_NODE,
						};
					}
					return node;
				});

				if (CURRENT_INNER_NODES.length == 0) {
					setOriginalExpandedSize({ width: 193, height: 200 });
				} else {
					if (STYLES.width != 68 && STYLES.height != 68)
						setOriginalExpandedSize({
							width: STYLES.width,
							height: STYLES.height,
						});
				}

				STYLES.width = STYLES.height = 68;

				reactFlowInstance.setNodes(
					getUpdatedArrayById(
						[
							...UPDATED_NODES,
							{ ...CURRENT_NODE, ...STYLES, style: { ...STYLES } },
						],
						reactFlowInstance.getNodes()
					) as Array<INode>
				);
			} else {
				//Moves the position of the visible blocks to its stored positions
				const MAX_POSITIONS = { x: 0, y: 0 };
				const NEW_INNER_NODES = CURRENT_INNER_NODES.map((node, index) => {
					{
						const NODE_X = data.innerNodes[index].position.x;
						const NODE_Y = data.innerNodes[index].position.y;
						node.position = {
							x: NODE_X,
							y: NODE_Y,
						};
						MAX_POSITIONS.x < NODE_X ? (MAX_POSITIONS.x = NODE_X) : null;
						MAX_POSITIONS.y < NODE_Y ? (MAX_POSITIONS.y = NODE_Y) : null;

						return node;
					}
				});

				const UPDATED_NODES = reactFlowInstance.getNodes().map((node) => {
					const MATCHING_NODE = NEW_INNER_NODES.find(
						(innerNode) => innerNode.id === node.id
					);
					if (MATCHING_NODE) {
						return {
							...node,
							...MATCHING_NODE,
						};
					}
					return node;
				});

				if (!originalExpandedSize) {
					STYLES.width = MAX_POSITIONS.x + 68;
					STYLES.height = MAX_POSITIONS.y + 68;
				} else {
					STYLES.width = originalExpandedSize.width;
					STYLES.height = originalExpandedSize.height;
				}

				reactFlowInstance.setNodes(
					getUpdatedArrayById(
						[
							...UPDATED_NODES,
							{ ...CURRENT_NODE, ...STYLES, style: { ...STYLES } },
						],
						reactFlowInstance.getNodes()
					) as Array<INode>
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
		//Forces children to be in bounds
		const RESULT = getInnerNodes().map((children) => {
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
		return RESULT;
	};

	const handleResizeEnd = (e, p) => {
		const NEW_WIDTH = p.width - 68;
		const NEW_HEIGHT = p.height - 126;

		const RESTRICTED_CHILDREN_ARRAY = restrictedChildren(NEW_WIDTH, NEW_HEIGHT);

		const UPDATED_INFO = {
			id: id,
			data: { ...data, innerNodes: RESTRICTED_CHILDREN_ARRAY },
		};

		reactFlowInstance.setNodes(
			getUpdatedArrayById(
				[UPDATED_INFO, ...RESTRICTED_CHILDREN_ARRAY],
				reactFlowInstance.getNodes()
			) as Array<INode>
		);
	};

	const resizeFragment = (height, width) => {
		const CURRENT_NODE = getNodeById(id, reactFlowInstance.getNodes());
		const STYLE = { height: height * 200, width: width * 125 };
		CURRENT_NODE.style = STYLE;
		CURRENT_NODE.height = STYLE.height;
		CURRENT_NODE.width = STYLE.width;

		const RESTRICTED_CHILDREN_ARRAY = restrictedChildren(
			STYLE.width - 125,
			STYLE.height - 200
		);

		let updatedChildrenBlockData = [];
		for (const [INDEX, CHILD_NODE] of originalChildrenStatus.entries()) {
			const NEW_NODE = getNodeById(CHILD_NODE.id, reactFlowInstance.getNodes());
			NEW_NODE.position.x = RESTRICTED_CHILDREN_ARRAY[INDEX].position.x;
			NEW_NODE.position.y = RESTRICTED_CHILDREN_ARRAY[INDEX].position.y;

			updatedChildrenBlockData.push({
				id: CHILD_NODE.id,
				x: RESTRICTED_CHILDREN_ARRAY[INDEX].position.x,
				y: RESTRICTED_CHILDREN_ARRAY[INDEX].position.y,
			});
		}

		reactFlowInstance.setNodes(
			getUpdatedArrayById(
				[CURRENT_NODE, ...updatedChildrenBlockData],
				reactFlowInstance.getNodes()
			) as Array<INode>
		);
	};

	const dismantleSelf = () => {
		const CURRENT_NODE = getNodeById(id, reactFlowInstance.getNodes());
		const INNER_NODE = getInnerNodes();

		const UPDATED_INNER_NODES = INNER_NODE.map((node) => {
			node.parentNode = undefined;
			node.expandParent = false;
			node.position = node.positionAbsolute;
			return node;
		});

		reactFlowInstance.setNodes(
			getUpdatedArrayById(
				UPDATED_INNER_NODES,
				reactFlowInstance.getNodes().filter((node) => node.id != id)
			) as Array<INode>
		);
	};

	const getAriaLabel = (): string => {
		let end = "";
		if (data.section && data.order) {
			end = data.section
				? ", forma parte de la sección " +
				  data.section +
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

	const shouldApplyAnimation =
		nodeSelected && nodeSelected.id === id && expandedAside;

	const containerClassName = !reducedAnimations
		? styles.nodeSelected
		: styles.nodeSelectedNoAnimated;

	return (
		<>
			{expanded && (
				<NodeResizer
					minWidth={125}
					minHeight={200}
					onResizeEnd={handleResizeEnd}
				/>
			)}
			<NodeToolbar position={Position.Left} offset={25}>
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
					(!expanded && shouldApplyAnimation && containerClassName) +
					" " +
					(expanded && "expandedFragment")
				}
				onClick={(e) => {
					if (e.detail === 2) {
						data.expanded = !data.expanded;
						setExpanded(!expanded);
					}
					if (e.detail === 3) {
						handleEdit();
					}
				}}
				onKeyDown={(e) => {
					if (e.key == "e") {
						data.expanded = !data.expanded;
						setExpanded(!expanded);
					}
					if (e.key == "Enter") handleEdit();
				}}
				tabIndex={0}
				aria-label={getAriaLabel()}
			>
				{!expanded && (
					<span className={styles.blockInfo + " " + styles.top}>
						{data.label}
					</span>
				)}
				<div>
					<FontAwesomeIcon icon={faCubes} />
					{expanded && parseBool(process.env.NEXT_PUBLIC_DEV_MODE) && (
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
