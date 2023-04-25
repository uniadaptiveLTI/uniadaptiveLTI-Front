import styles from "@components/styles/BlockContextualMenu.module.css";
import { useState, useEffect, forwardRef, useRef, useContext } from "react";
import { Button } from "react-bootstrap";
import FocusTrap from "focus-trap-react";
import {
	PlusSquareFill,
	Diagram2Fill,
	Scissors,
	Clipboard2Fill,
	Clipboard2PlusFill,
	Trash3Fill,
} from "react-bootstrap-icons";
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

	const createBlock = (blockData) => {
		//TODO: Block selector
		const reactFlowBounds = blockFlowDOM.current?.getBoundingClientRect();
		let flowPos = reactFlowInstance.project({
			x: x - reactFlowBounds.left,
			y: y - reactFlowBounds.top,
		});

		if (expanded) {
			const asideBounds = document
				.getElementsByTagName("aside")[0]
				.getBoundingClientRect();
			flowPos.x += Math.floor(asideBounds.width / 125) * 125;
		}

		let newBlockCreated;

		if (blockData) {
			//TODO: Make it variable
			newBlockCreated = {
				id: uniqueId(),
				x: flowPos.x,
				y: flowPos.y + 175,
				type: "file",
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
					y: flowPos.y + 175,
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
					y: flowPos.y + 175,
					type: "file",
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
		setBlocksData(newBlocksData); //FIXME: Los cambios no se mantienen, apuntar a una medalla apunta a 0
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
					left: `${x}px`,
				}}
				className={styles.cM + " "}
			>
				{contextMenuOrigin == "pane" && (
					<div ref={ref} className={styles.cM + " "}>
						<li>
							<Button variant="light" onClick={() => createBlock()}>
								<div role="button">
									<PlusSquareFill />
									Crear nuevo bloque...
								</div>
							</Button>
						</li>
						<li>
							<Button variant="light" disabled onClick={notImplemented}>
								<div>
									<Clipboard2PlusFill />
									Pegar bloque/s
								</div>
							</Button>
						</li>
					</div>
				)}
				{contextMenuOrigin == "block" && (
					<div ref={ref} className={styles.cM + " "}>
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
											<Diagram2Fill />
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
											<Diagram2Fill />
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
											<Diagram2Fill /> Crear relación
										</div>
									</Button>
								</li>
							)
						)}
						<li>
							<Button variant="light" onClick={notImplemented}>
								<div>
									<Clipboard2Fill />
									Copiar bloque
								</div>
							</Button>
						</li>
						<li>
							<Button variant="light" onClick={notImplemented}>
								<div>
									<Scissors />
									Cortar bloque
								</div>
							</Button>
						</li>
						<li>
							<Button variant="light" onClick={handleDeleteBlock}>
								<div>
									<Trash3Fill />
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
									<Clipboard2Fill />
									Copiar bloques
								</div>
							</Button>
						</li>
						<li>
							<Button variant="light" onClick={notImplemented}>
								<div>
									<Scissors />
									Cortar bloques
								</div>
							</Button>
						</li>
						<li>
							<Button variant="light" onClick={handleDeleteBlockSelection}>
								<div>
									<Trash3Fill />
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
