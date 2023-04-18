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
import { CreateBlockContext, DeleteBlockContext } from "@components/pages/_app";
import { toast } from "react-toastify";

const notImplemented = () => {
	toast("Esta función no ha sido implementada.", {
		hideProgressBar: false,
		autoClose: 2000,
		type: "error",
		position: "bottom-center",
		theme: "colored",
	});
};

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
			id: newId,
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

	function moveAllBranchUp(
		blocksData,
		currentBlock,
		orderedBlocks = [],
		difference,
		mainBranch,
		bifurcation,
		maxY,
		maxed
	) {
		if (currentBlock.children) {
			for (let childrenBlockId of currentBlock.children) {
				if (childrenBlockId > 0) {
					let childrenBlock = blocksData.find((e) => e.id === childrenBlockId);
					const isChildrenBlockStored = mainBranch.some(
						(b) => b.id === childrenBlock.id
					);

					if (!isChildrenBlockStored) {
						childrenBlock.y -= difference;
					} else {
						if (!bifurcation) {
							childrenBlock.y -= difference;
							if (maxed) {
								childrenBlock.y += 1;
								if (childrenBlock.y > maxY) {
									childrenBlock.y -= difference + 1;
								}
							}
						} else {
							childrenBlock.y -= difference;
						}
					}

					moveAllBranchUp(
						blocksData,
						childrenBlock,
						orderedBlocks,
						difference,
						mainBranch,
						bifurcation,
						maxY,
						maxed
					);
				}
			}
		}
	}

	function moveAllBranchDown(
		blocksData,
		currentBlock,
		orderedBlocks = [],
		difference
	) {
		if (currentBlock.children) {
			for (let childrenBlockId of currentBlock.children) {
				if (childrenBlockId > 0) {
					let childrenBlock = blocksData.find((e) => e.id === childrenBlockId);

					console.log(
						"Difference between: " + childrenBlock.title + " : " + difference
					);

					childrenBlock.y += difference;

					moveAllBranchDown(
						blocksData,
						childrenBlock,
						orderedBlocks,
						difference
					);
				}
			}
		}
	}

	function searchBifurcation(blocksData, currentBlock, orderedBlocks = []) {
		if (blocksData && currentBlock) {
			orderedBlocks.push(currentBlock);
			if (currentBlock.children) {
				if (currentBlock.children.length <= 1) {
					for (let childrenBlockId of currentBlock.children) {
						if (childrenBlockId > 0) {
							let childrenBlock = blocksData.find(
								(e) => e.id === childrenBlockId
							);

							return searchBifurcation(
								blocksData,
								childrenBlock,
								orderedBlocks
							);
						}
					}
				} else {
					return true;
				}
			} else {
				return false;
			}
		}
	}

	function searchFirstChild(blocksData, currentBlock, maxY) {
		for (let block of blocksData) {
			if (block.children && block.children.includes(currentBlock.id)) {
				console.log(block);
				if (block.children.length > 0 && block.y > maxY && block.id > -1) {
					return searchFirstChild(blocksData, block, maxY);
				} else {
					if (block.id > -1) {
						return currentBlock;
					} else {
						return blocksData.find((e) => e.id === block.children[0]);
					}
				}
			}
		}
	}

	function moveRight(blocksData, currentBlock, orderedBlocks = []) {
		if (currentBlock.type != "badge") {
			if (blocksData && currentBlock) {
				orderedBlocks.push(currentBlock);
				if (currentBlock.children) {
					for (let childrenBlockId of currentBlock.children) {
						if (childrenBlockId > 0) {
							let childrenBlock = blocksData.find(
								(e) => e.id === childrenBlockId
							);

							childrenBlock.x += 1;

							moveRight(blocksData, childrenBlock, orderedBlocks);
						}
					}
				}
			}
		}
		return orderedBlocks;
	}

	function moveLeft(blocksData, currentBlock, orderedBlocks = []) {
		if (currentBlock.type != "badge") {
			if (blocksData && currentBlock) {
				orderedBlocks.push(currentBlock);
				if (currentBlock.children) {
					for (let childrenBlockId of currentBlock.children) {
						if (childrenBlockId > 0) {
							let childrenBlock = blocksData.find(
								(e) => e.id === childrenBlockId
							);

							childrenBlock.x -= 1;

							moveLeft(blocksData, childrenBlock, orderedBlocks);
						}
					}
				}
			}
		}
		return orderedBlocks;
	}

	function moveUp(blocksData, currentBlock, orderedBlocks = [], difference) {
		if (currentBlock.type != "badge") {
			if (blocksData && currentBlock) {
				orderedBlocks.push(currentBlock);
				if (currentBlock.children) {
					for (let childrenBlockId of currentBlock.children) {
						if (childrenBlockId > 0) {
							let childrenBlock = blocksData.find(
								(e) => e.id === childrenBlockId
							);
							childrenBlock.y -= difference;
							moveUp(blocksData, childrenBlock, orderedBlocks, difference);
						}
					}
				}
			}
		}
		return orderedBlocks;
	}

	function moveDown(blocksData, currentBlock, orderedBlocks = [], difference) {
		if (currentBlock.type != "badge") {
			if (blocksData && currentBlock) {
				orderedBlocks.push(currentBlock);
				if (currentBlock.children) {
					for (let childrenBlockId of currentBlock.children) {
						if (childrenBlockId > 0) {
							let childrenBlock = blocksData.find(
								(e) => e.id === childrenBlockId
							);
							childrenBlock.y += difference;
							moveDown(blocksData, childrenBlock, orderedBlocks, difference);
						}
					}
				}
			}
		}
		return orderedBlocks;
	}

	function searchRowBlocks(blocksData, orderedBlocks) {
		const filteredArrayJson = blocksData.filter(
			(item) => item.y === orderedBlocks[0].y
		);

		filteredArrayJson.forEach((item) => {
			if (!orderedBlocks.some((block) => block.id === item.id)) {
				orderedBlocks.push(item);
			}
		});
	}

	console.log(x + " " + y);

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
