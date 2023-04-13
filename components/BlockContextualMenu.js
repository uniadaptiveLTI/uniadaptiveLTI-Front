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
		dimensions,
		blockData,
		blocksData,
		setBlocksData,
		setShowContextualMenu,
	},
	ref
) {
	let [localDimensions, setLocalDimensions] = useState(
		dimensions
			? JSON.parse(dimensions)
			: {
					blockCanvasOffsetX: 0,
					blockCanvasOffsetY: 0,
					blockCanvasScrollX: 0,
					blockCanvasScrollY: 0,
					contextMenuOffsetX: 0,
					contextMenuOffsetY: 0,
			  }
	);
	const [reversed, setReversed] = useState(
		blockData.type == "end" ? true : false
	);

	const [initialValues, setInitialValues] = useState({
		scrollX: localDimensions.blockCanvasScrollX,
		scrollY: localDimensions.blockCanvasScrollY,
	});

	const { createdBlock, setCreatedBlock } = useContext(CreateBlockContext);
	const { deletedBlock, setDeletedBlock } = useContext(DeleteBlockContext);

	const handleScroll = (e) => {
		setLocalDimensions((prevState) => ({
			...prevState,
			blockCanvasScrollX: e.target.scrollLeft,
			blockCanvasScrollY: e.target.scrollTop,
		}));
	};

	const createBlock = () => {
		const lastId = blocksData[blocksData.length - 1].id;
		const newId = lastId + 1;

		const newBlockCreated = {
			id: newId,
			x: blockData.x + 1,
			y: blockData.y,
			type: "forum",
			title: "Nuevo Bloque",
			children: blockData.children && blockData.children,
		};
		console.log(newBlockCreated);
		moveRight(blocksData, newBlockCreated, []);
		setShowContextualMenu(false);
		setCreatedBlock(newBlockCreated);
	};

	const deleteBlock = () => {
		// Find the father block which children includes the id of the selected block

		const fatherBlock = blocksData.find(
			(b) => b.children && b.children.includes(blockData.id)
		);

		const children = blockData.children;
		let childrenNumber = 0;
		if (children) {
			childrenNumber = children.length;
		}

		//If not a bifurcation
		if (childrenNumber < 2) {
			// Set the maximum y
			const maxY = fatherBlock.y - 1;

			// If to check if the selected block has children
			if (blockData.children != undefined) {
				if (fatherBlock.children.length > 1) {
					const indexToRemove2 = fatherBlock.children.findIndex(
						(child) => child === blockData.id
					);

					if (indexToRemove2 !== -1) {
						const updatedChildren = [...fatherBlock.children];
						updatedChildren.splice(indexToRemove2, 1);

						const newChildren = [...updatedChildren, ...blockData.children];
						fatherBlock.children = newChildren;
					}
				} else {
					fatherBlock.children = blockData.children;
				}
				moveLeft(blocksData, blockData, []);
			}
			// Else to check the selected block has no children
			else {
				/* Remove the id of the selected block from the father block children prop
			   (Destroy the relation ship between the parent and its child) */
				const indexToRemove = fatherBlock.children.indexOf(blockData.id);
				const newChildren = [
					...fatherBlock.children.slice(0, indexToRemove),
					...fatherBlock.children.slice(indexToRemove + 1),
				];

				// If to check if the father block is a bifurcation using the length of the newChildren
				if (newChildren.length > 0) {
					fatherBlock.children = newChildren;

					/* Search the first block within the branch using the father block and the maxY
				to avoid merge with other branches */
					const childNumber = fatherBlock.children[0];
					const childBlock = blocksData.find((obj) => obj.id === childNumber);
					const firstChild = searchFirstChild(blocksData, fatherBlock, maxY);

					// If to check that the remaining child is the lower bifuraction
					if (childBlock.y > fatherBlock.y) {
						// Calculate difference of "y" of the child block and the parent block
						var difference = childBlock.y - fatherBlock.y;

						// Move up the child block and its children with the difference
						const orderedBlocks = moveUp(
							blocksData,
							fatherBlock,
							[],
							difference
						);

						// Search in the same row as the father and add it to the orderedBlocks array
						searchRowBlocks(blocksData, orderedBlocks);

						// Search if the remaining bifurcation is bifurcated
						const bifurcation = searchBifurcation(blocksData, childBlock, []);

						// If to check that the remaning bifurcation is bifurcated
						if (bifurcation) {
							// Check after the branch is moved if there is a block which y is lower than the selected block
							const found = orderedBlocks.some((obj) => obj.y < blockData.y);

							// If a block is found
							if (found) {
								// Search the block
								const lowestYJson = orderedBlocks.reduce((acc, obj) => {
									return obj.y < acc.y ? obj : acc;
								});

								/* Calculate the difference between the first block and the lowest block
							   minus 1 */
								const lowestJsonDifference = firstChild.y - lowestYJson.y - 1;

								// Move all the branch down to fit the lowest block to be at the top
								firstChild.y += lowestJsonDifference;

								moveAllBranchDown(
									blocksData,
									firstChild,
									[],
									lowestJsonDifference
								);
								lowestYJson.y = blockData.y;
							}
						}
						// Else to check that the remaining bifurcation is not bifurcated
						else {
							var maxed = false;

							// Condition to check if the first block "y" does not surpass maxY
							if (firstChild.y - (difference + 1) <= maxY) {
								firstChild.y -= difference;
							} else {
								firstChild.y -= difference + 1;
								difference += 1;
								maxed = true;
							}

							moveAllBranchUp(
								blocksData,
								firstChild,
								[],
								difference,
								orderedBlocks,
								bifurcation,
								maxY,
								maxed
							);
						}
					}
					// Else to check that the remaining child is the upper bifuraction
					else {
						// Calculate difference of "y" of the child block and the parent block
						var difference = fatherBlock.y - childBlock.y;

						// Move down the child block and its children with the difference
						const orderedBlocks = moveDown(
							blocksData,
							fatherBlock,
							[],
							difference
						);

						// Search in the same row as the father and add it to the orderedBlocks array
						searchRowBlocks(blocksData, orderedBlocks);

						// Search if the remaining bifurcation is bifurcated
						const bifurcation = searchBifurcation(blocksData, childBlock, []);

						var maxed = false;

						// If to check that the remaning bifurcation is not bifurcated
						if (!bifurcation) {
							// Condition to check if the first block "y" does not surpass maxY
							if (firstChild.y - (difference + 1) <= maxY) {
								firstChild.y -= difference;
							} else {
								firstChild.y -= difference + 1;
								difference += 1;
								maxed = true;
							}
						} else {
							firstChild.y -= difference;
						}

						moveAllBranchUp(
							blocksData,
							firstChild,
							[],
							difference,
							orderedBlocks,
							bifurcation,
							maxY,
							maxed
						);
					}
				} else {
					fatherBlock.children = undefined;
				}
			}

			setShowContextualMenu(false);
			setDeletedBlock(blockData);
		} else {
			toast(
				"El borrado de bifurcaciones no está implementado, elimine una rama manualmente.",
				{
					hideProgressBar: false,
					autoClose: 4000,
					type: "error",
					position: "bottom-center",
					theme: "colored",
				}
			);
			setShowContextualMenu(false);
		}
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

	//Por render
	useEffect(() => {
		const mainElement = document.getElementById("main");
		mainElement.addEventListener("scroll", handleScroll);

		setInitialValues({
			scrollX: localDimensions.blockCanvasScrollX,
			scrollY: localDimensions.blockCanvasScrollY,
		});

		return () => {
			mainElement.removeEventListener("scroll", handleScroll);
		};
	}, []);

	//Cuando las dimensiones o el scroll cambian
	useEffect(() => {
		setLocalDimensions((prevState) => ({
			...prevState,
			contextMenuOffsetX: x - prevState.blockCanvasScrollX,
			contextMenuOffsetY: y - prevState.blockCanvasScrollY,
		}));
	}, [x, y, dimensions]);

	//Cuando el bloque cambia
	useEffect(() => {
		setInitialValues({
			scrollX: localDimensions.blockCanvasScrollX,
			scrollY: localDimensions.blockCanvasScrollY,
		});
		setReversed(blockData.type == "end" ? true : false);
	}, [x, y]);

	return (
		<FocusTrap
			focusTrapOptions={{
				clickOutsideDeactivates: true,
				returnFocusOnDeactivate: true,
			}}
		>
			<ul
				ref={ref}
				className={styles.cM + " " + (reversed ? styles.reversed : "")}
				style={
					reversed
						? {
								top: `calc(${
									y +
									(+initialValues.scrollY - localDimensions.blockCanvasScrollY)
								}px - 6em)`,
								left: `calc(${
									x +
									(+initialValues.scrollX - localDimensions.blockCanvasScrollX)
								}px - 16em)`,
						  }
						: {
								top: `calc(${
									y +
									(+initialValues.scrollY - localDimensions.blockCanvasScrollY)
								}px - 6em)`,
								left: `calc(${
									x +
									(+initialValues.scrollX - localDimensions.blockCanvasScrollX)
								}px + 1em)`,
						  }
				}
			>
				<li>
					<Button variant="light" onClick={createBlock}>
						<div role="button">
							<PlusSquareFill />
							Crear nuevo bloque...
						</div>
					</Button>
				</li>
				<li>
					<Button variant="light" onClick={notImplemented}>
						<div>
							<Diagram2Fill />
							Crear bifurcación...
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
					<Button variant="light" onClick={notImplemented}>
						<div>
							<Clipboard2Fill />
							Copiar bloque
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
				<li>
					<Button variant="light" onClick={deleteBlock}>
						<div>
							<Trash3Fill />
							Eliminar bloque...
						</div>
					</Button>
				</li>
			</ul>
		</FocusTrap>
	);
}
const BlockContextualMenuWithRef = forwardRef(BlockContextualMenu);
export default BlockContextualMenuWithRef;
