import styles from "@components/styles/BlockContextualMenu.module.css";
import { useState, useEffect, forwardRef, useRef, useContext } from "react";
import { Button, Modal } from "react-bootstrap";
import FocusTrap from "focus-trap-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faSquarePlus,
	faDiagramNext,
	faScissors,
	faClipboard,
	faPaste,
	faTrashCan,
	faDiagramProject,
	faEdit,
} from "@fortawesome/free-solid-svg-icons";
import {
	CreateBlockContext,
	BlockInfoContext,
	ExpandedContext,
	notImplemented,
	ReactFlowInstanceContext,
	PlatformContext,
} from "@components/pages/_app";
import { BlockOriginContext, deleteblocks } from "./BlockCanvas";
import { ActionBlocks } from "./flow/nodes/ActionNode";
import { toast } from "react-toastify";
import { uniqueId } from "./Utils";

function BlockContextualMenu(
	{
		x,
		y,
		blockData,
		blocksData,
		setBlocksData,
		setShowContextualMenu,
		setShowConditionsModal,
		contextMenuOrigin,
		blockFlowDOM,
		deleteBlocks,
	},
	ref
) {
	const { createdBlock, setCreatedBlock } = useContext(CreateBlockContext);
	const { blockOrigin, setBlockOrigin } = useContext(BlockOriginContext);
	const { blockSelected, setBlockSelected } = useContext(BlockInfoContext);
	const { reactFlowInstance, setReactFlowInstance } = useContext(
		ReactFlowInstanceContext
	);
	const { expanded, setExpanded } = useContext(ExpandedContext);
	const { platform, setPlatform } = useContext(PlatformContext);

	const asideBounds = expanded
		? document.getElementsByTagName("aside")[0]?.getBoundingClientRect()
		: 0;

	const createBlock = (blockData) => {
		//TODO: Block selector
		const reactFlowBounds = blockFlowDOM.current?.getBoundingClientRect();
		let flowPos = reactFlowInstance.project({
			x: x - reactFlowBounds.left,
			y: y - reactFlowBounds.top,
		});

		if (expanded) {
			flowPos.x += Math.floor(asideBounds.width / 125) * 125;
		}

		let newBlockCreated;

		if (blockData) {
			//TODO: Make it variable
			newBlockCreated = {
				id: uniqueId(),
				x: flowPos.x,
				y: flowPos.y,
				type: "resource",
				title: "Nuevo bloque",
				children: undefined,
				order: 100,
				unit: 1,
			};
		} else {
			if (platform == "moodle") {
				newBlockCreated = {
					id: uniqueId(),
					x: flowPos.x,
					y: flowPos.y,
					type: "generic",
					title: "Nuevo bloque",
					children: undefined,
					order: 100,
					unit: 1,
				};
			} else {
				newBlockCreated = {
					id: uniqueId(),
					x: flowPos.x,
					y: flowPos.y,
					type: "resource",
					title: "Nuevo bloque",
					children: undefined,
					order: 100,
					unit: 1,
				};
			}
		}

		setShowContextualMenu(false);
		setCreatedBlock(newBlockCreated);
	};

	const handleDeleteBlock = () => {
		setShowContextualMenu(false);
		setBlockSelected();
		deleteBlocks(blockData);
	};

	const handleDeleteBlockSelection = () => {
		setShowContextualMenu(false);
		const selectedNodes = document.querySelectorAll(
			".react-flow__node.selected"
		);
		const blockDataArray = [];
		for (let node of selectedNodes) {
			let SingularBlockData = blocksData.find(
				(block) => block.id == node.dataset.id
			);
			blockDataArray.push(SingularBlockData);
		}

		deleteBlocks(blockDataArray);
	};

	const handleNewRelation = (origin, end) => {
		setShowContextualMenu(false);
		const newBlocksData = [...blocksData];
		const bI = newBlocksData.findIndex((block) => block.id == origin.id);
		if (newBlocksData[bI].children) {
			const alreadyAChildren = newBlocksData[bI].children.includes(end.id);
			if (!alreadyAChildren) {
				if (newBlocksData[bI].children) {
					newBlocksData[bI].children.push(end.id);
				} else {
					newBlocksData[bI].children = [end.id];
				}
			} else {
				toast("Esta relación ya existe", {
					hideProgressBar: false,
					autoClose: 2000,
					type: "info",
					position: "bottom-center",
					theme: "light",
				});
			}
		} else {
			newBlocksData[bI].children = [end.id];
		}
		setBlockOrigin();
		setBlocksData(newBlocksData); //FIXME: The changes doesn't stay, a badge gives 0
	};

	const handleShow = () => {
		setShowConditionsModal(true);
		setShowContextualMenu(false);
	};

	return (
		<FocusTrap
			focusTrapOptions={{
				clickOutsideDeactivates: true,
				returnFocusOnDeactivate: true,
			}}
		>
			<div
				ref={ref}
				style={{
					top: `${y}px`,
					left: `${x + (asideBounds && asideBounds.width)}px`,
				}}
				className={styles.cM + " "}
			>
				{contextMenuOrigin == "pane" && (
					<div ref={ref} className={styles.cM + " "}>
						<li>
							<Button variant="light" onClick={() => createBlock()}>
								<div role="button">
									<FontAwesomeIcon icon={faSquarePlus} />
									Crear nuevo bloque...
								</div>
							</Button>
						</li>
						<li>
							<Button variant="light" disabled onClick={notImplemented}>
								<div>
									<FontAwesomeIcon icon={faPaste} />
									Pegar bloque/s
								</div>
							</Button>
						</li>
					</div>
				)}
				{contextMenuOrigin == "block" && (
					<div ref={ref} className={styles.cM + " "}>
						<li>
							<Button variant="light" onClick={handleShow}>
								<div>
									<FontAwesomeIcon icon={faEdit} />
									Editar precondiciones
								</div>
							</Button>
						</li>
						{blockOrigin ? (
							blockOrigin.id == blockData.id ? (
								<li>
									<Button
										variant="light"
										onClick={() => {
											setBlockOrigin();
											setShowContextualMenu(false);
										}}
									>
										<div>
											<FontAwesomeIcon icon={faDiagramNext} />
											Cancelar relación
										</div>
									</Button>
								</li>
							) : (
								<li>
									<Button
										variant="light"
										onClick={() => handleNewRelation(blockOrigin, blockData)}
									>
										<div>
											<FontAwesomeIcon icon={faDiagramNext} />
											<div
												style={{
													display: "flex",
													flexDirection: "column",
													alignItems: "flex-start",
												}}
											>
												<span>Terminar relación</span>
												<span style={{ fontSize: "0.7em" }}>
													Unir a "{blockOrigin.title}"
												</span>
											</div>
										</div>
									</Button>
								</li>
							)
						) : (
							[...ActionBlocks, "end"].includes(blockData.type) == false && (
								<li>
									<Button
										variant="light"
										onClick={() => {
											setBlockOrigin(blockData);
											setShowContextualMenu(false);
										}}
									>
										<div>
											<FontAwesomeIcon icon={faDiagramNext} /> Crear relación
										</div>
									</Button>
								</li>
							)
						)}
						<li>
							<Button variant="light" onClick={notImplemented}>
								<div>
									<FontAwesomeIcon icon={faClipboard} />
									Copiar bloque
								</div>
							</Button>
						</li>
						<li>
							<Button variant="light" onClick={notImplemented}>
								<div>
									<FontAwesomeIcon icon={faScissors} />
									Cortar bloque
								</div>
							</Button>
						</li>
						<li>
							<Button variant="light" onClick={handleDeleteBlock}>
								<div>
									<FontAwesomeIcon icon={faTrashCan} />
									Eliminar bloque...
								</div>
							</Button>
						</li>
					</div>
				)}
				{contextMenuOrigin == "nodesselection" && (
					<div ref={ref} className={styles.cM + " "}>
						<li>
							<Button variant="light" onClick={notImplemented}>
								<div>
									<FontAwesomeIcon icon={faDiagramProject} />
									Crear fragmento
								</div>
							</Button>
						</li>
						<li>
							<Button variant="light" onClick={notImplemented}>
								<div>
									<FontAwesomeIcon icon={faClipboard} />
									Copiar bloques
								</div>
							</Button>
						</li>
						<li>
							<Button variant="light" onClick={notImplemented}>
								<div>
									<FontAwesomeIcon icon={faScissors} />
									Cortar bloques
								</div>
							</Button>
						</li>
						<li>
							<Button variant="light" onClick={handleDeleteBlockSelection}>
								<div>
									<FontAwesomeIcon icon={faTrashCan} />
									Eliminar bloques...
								</div>
							</Button>
						</li>
					</div>
				)}
			</div>
		</FocusTrap>
	);
}
const BlockContextualMenuWithRef = forwardRef(BlockContextualMenu);
export default BlockContextualMenuWithRef;
