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
	DeleteBlockContext,
	notImplemented,
} from "@components/pages/_app";

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

	const createBlock = () => {
		//FIXME: It doesn't push the block at start
		const lastId = blocksData[blocksData.length - 1].id;
		const newId = lastId + 1;
		//TODO: Block selector
		console.log(x + " " + y);
		const newBlockCreated = {
			id: parseInt(newId),
			x: x,
			y: y,
			type: "forum",
			title: "Nuevo Foro",
			children: undefined,
		};
		console.log(newBlockCreated);
		setShowContextualMenu(false);
		setCreatedBlock(newBlockCreated);
	};

	const deleteBlock = () => {
		console.log(blockData);
		setShowContextualMenu(false);
		setDeletedBlock(blockData);
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
						<li>
							<Button variant="light" onClick={notImplemented}>
								<div>
									<Diagram2Fill />
									Crear relación
								</div>
							</Button>
						</li>
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
