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

/**
 * Displays a toast message indicating that the function has not been implemented.
 */
const notImplemented = () => {
	toast("Esta función no ha sido implementada.", {
		hideProgressBar: false,
		autoClose: 2000,
		type: "error",
		position: "bottom-center",
		theme: "colored",
	});
};

/**
 * Renders a contextual menu for a block.
 * @param {number} x - The x position of the block.
 * @param {number} y - The y position of the block.
 * @param {Object} dimensions - The dimensions of the block canvas and contextual menu.
 * @param {Object} blockData - The data of the selected block.
 * @param {Array} blocksData - An array of all blocks data.
 * @param {function} setBlocksData - A function to update the blocks data.
 * @param {function} setShowContextualMenu - A function to show/hide the contextual menu.
 * @param {Object} ref - A React ref to access the DOM element of the component.
 */
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
			children: blockData.children ? blockData.children : [],
		};
		moveRight(blocksData, newBlockCreated, []);
		setShowContextualMenu(false);
		setCreatedBlock(newBlockCreated);
	};

	const deleteBlock = () => {
		const lastId = blocksData[blocksData.length - 1].id;
		const newId = lastId + 1;

		const fatherBlock = blocksData.find(
			(b) => b.children && b.children.includes(blockData.id)
		);

		console.log(blockData.children);

		if (blockData.children != undefined) {
			fatherBlock.children = blockData.children;
			moveLeft(blocksData, fatherBlock, []);
		} else {
			const indexToRemove = fatherBlock.children.indexOf(blockData.id);
			const newChildren = [
				...fatherBlock.children.slice(0, indexToRemove),
				...fatherBlock.children.slice(indexToRemove + 1),
			];

			console.log(newChildren);

			fatherBlock.children = newChildren;

			const childNumber = fatherBlock.children[0];
			const childObject = blocksData.find((obj) => obj.id === childNumber);

			if (childObject.y != fatherBlock.y) {
				const difference = childObject.y - fatherBlock.y;
				moveUp(blocksData, fatherBlock, [], difference);

				const firstChild = searchFirstChild(blocksData, fatherBlock);
				const firstFather = searchFirstFather(blocksData, fatherBlock);

				if (firstFather.children[1] === firstChild.id) {
					firstChild.y -= difference;
					moveAllBranchUp(blocksData, firstChild, [], difference);
				}
			}
		}

		setShowContextualMenu(false);
		setDeletedBlock(blockData);
	};

	/**
	 * Recursively moves all blocks in a branch up by a specified difference.
	 * @param {Array} blocksData - An array of all blocks data.
	 * @param {Object} currentBlock - The current block being processed.
	 * @param {Array} orderedBlocks - An array of ordered blocks (default: []).
	 * @param {number} difference - The difference to move the blocks up by.
	 */
	function moveAllBranchUp(
		blocksData,
		currentBlock,
		orderedBlocks = [],
		difference
	) {
		if (currentBlock.children) {
			for (let childrenBlockId of currentBlock.children) {
				if (childrenBlockId > 0) {
					let childrenBlock = blocksData.find((e) => e.id === childrenBlockId);

					childrenBlock.y -= difference;

					moveAllBranchUp(blocksData, childrenBlock, orderedBlocks, difference);
				}
			}
		}
	}

	/**
	 * Recursively searches for the first child block in a branch.
	 * @param {Array} blocksData - An array of all blocks data.
	 * @param {Object} currentBlock - The current block being processed.
	 * @returns {Object} The first child block found.
	 */
	function searchFirstChild(blocksData, currentBlock) {
		console.log(currentBlock);
		for (let block of blocksData) {
			if (block.children && block.children.includes(currentBlock.id)) {
				if (block.children.length == 1) {
					return searchFirstChild(blocksData, block);
				} else {
					return currentBlock;
				}
			}
		}
	}

	/**
	 * Recursively searches for the first father block in a branch.
	 * @param {Array} blocksData - An array of all blocks data.
	 * @param {Object} currentBlock - The current block being processed.
	 * @returns {Object} The first father block found.
	 */
	function searchFirstFather(blocksData, currentBlock) {
		console.log("First Father: " + currentBlock.title);
		for (let block of blocksData) {
			if (block.children && block.children.includes(currentBlock.id)) {
				if (block.children.length == 1) {
					return searchFirstFather(blocksData, block);
				} else {
					return block;
				}
			}
		}
	}

	/**
	 * Recursively moves all blocks in a branch to the right.
	 * @param {Array} blocksData - An array of all blocks data.
	 * @param {Object} currentBlock - The current block being processed.
	 * @param {Array} orderedBlocks - An array of ordered blocks (default: []).
	 * @returns {Array} An array of ordered blocks.
	 */
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

	/**
	 * Recursively moves all blocks in a branch to the left.
	 * @param {Array} blocksData - An array of all blocks data.
	 * @param {Object} currentBlock - The current block being processed.
	 * @param {Array} orderedBlocks - An array of ordered blocks (default: []).
	 * @returns {Array} An array of ordered blocks.
	 */
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

	/**
	 * Recursively moves all blocks in a branch up by a specified difference.
	 * @param {Array} blocksData - An array of all blocks data.
	 * @param {Object} currentBlock - The current block being processed.
	 * @param {Array} orderedBlocks - An array of ordered blocks (default: []).
	 * @param {number} difference - The difference to move the blocks up by.
	 * @returns {Array} An array of ordered blocks.
	 */
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

	//First render
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

	//When scrolling
	useEffect(() => {
		setLocalDimensions((prevState) => ({
			...prevState,
			contextMenuOffsetX: x - prevState.blockCanvasScrollX,
			contextMenuOffsetY: y - prevState.blockCanvasScrollY,
		}));
	}, [x, y, dimensions]);

	//When the (selected) block changes
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
