import styles from "@components/styles/BlockContextualMenu.module.css";
import {
	useState,
	useEffect,
	forwardRef,
	useRef,
	useContext,
	useId,
} from "react";
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
	DeleteBlockContext,
	notImplemented,
} from "@components/pages/_app";
import { BlockOriginContext } from "./BlockCanvas";
import { ActionBlocks } from "./flow/nodes/ActionNode";
import { toast } from "react-toastify";

function BlockContextualMenu(
	{
		x,
		y,
		blockData,
		blocksData,
		setBlocksData,
		setShowContextualMenu,
		nodeSelected,
	},
	ref
) {
	const { createdBlock, setCreatedBlock } = useContext(CreateBlockContext);
	const { deletedBlock, setDeletedBlock } = useContext(DeleteBlockContext);
	const { blockOrigin, setBlockOrigin } = useContext(BlockOriginContext);

	const newId = useId();

	const createBlock = () => {
		//FIXME: It doesn't push the block at start
		//TODO: Block selector
		const newBlockCreated = {
			id: newId,
			x: x,
			y: y,
			type: "forum",
			title: "Nuevo Foro",
			children: undefined,
		};

		setShowContextualMenu(false);
		setCreatedBlock(newBlockCreated);
	};

	const deleteBlock = () => {
		setShowContextualMenu(false);
		setDeletedBlock(blockData);
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
			<ul
				ref={ref}
				style={{
					top: `${y}px`,
					left: `${x}px`,
				}}
				className={styles.cM + " "}
			>
				{!nodeSelected && (
					<ul ref={ref} className={styles.cM + " "}>
						<li>
							<Button variant="light" onClick={createBlock}>
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
									Pegar bloque
								</div>
							</Button>
						</li>
					</ul>
				)}
				{nodeSelected && (
					<ul ref={ref} className={styles.cM + " "}>
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
							<Button variant="light" onClick={deleteBlock}>
								<div>
									<Trash3Fill />
									Eliminar bloque...
								</div>
							</Button>
						</li>
					</ul>
				)}
			</ul>
		</FocusTrap>
	);
}
const BlockContextualMenuWithRef = forwardRef(BlockContextualMenu);
export default BlockContextualMenuWithRef;
