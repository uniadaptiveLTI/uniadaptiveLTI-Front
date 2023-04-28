import styles from "@components/styles/BlockContextualMenu.module.css";
import { forwardRef, useContext } from "react";
import {
	CreateBlockContext,
	BlockInfoContext,
	ExpandedContext,
	ReactFlowInstanceContext,
	PlatformContext,
} from "@components/pages/_app";
import { BlockOriginContext } from "./BlockCanvas";
import { toast } from "react-toastify";
import { uniqueId } from "./Utils";
import CMBlockMenu from "./flow/contextualmenu/CMBlockMenu";
import CMPaneMenu from "./flow/contextualmenu/CMPaneMenu";
import CMSelectionMenu from "./flow/contextualmenu/CMSelectionMenu";

function ContextualMenu(
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
		containsReservedNodes,
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
		<>
			{containsReservedNodes ? (
				<div
					ref={ref}
					style={{
						top: `${y}px`,
						left: `${x + (asideBounds && asideBounds.width)}px`,
					}}
					className={styles.cM + " "}
				>
					{contextMenuOrigin == "block" && (
						<CMBlockMenu
							handleShow={handleShow}
							blockOrigin={blockOrigin}
							blockData={blockData}
							handleDeleteBlock={handleDeleteBlock}
							setBlockOrigin={setBlockOrigin}
							setShowContextualMenu={setShowContextualMenu}
							handleNewRelation={handleNewRelation}
							EnableEditPreconditions={false}
							EnableCreateRelation={true}
							EnableCut={false}
							EnableCopy={false}
							EnableDelete={false}
						/>
					)}
					{contextMenuOrigin == "nodesselection" && (
						<CMSelectionMenu
							handleDeleteBlockSelection={handleDeleteBlockSelection}
							EnableCreateFragment={false}
							EnableCut={false}
							EnableCopy={false}
							EnableDelete={false}
						/>
					)}
				</div>
			) : (
				<div
					ref={ref}
					style={{
						top: `${y}px`,
						left: `${x + (asideBounds && asideBounds.width)}px`,
					}}
					className={styles.cM + " "}
				>
					{contextMenuOrigin == "pane" && (
						<CMPaneMenu
							createBlock={createBlock}
							EnableCreate={true}
							EnablePaste={true}
						/>
					)}
					{contextMenuOrigin == "block" && (
						<CMBlockMenu
							handleShow={handleShow}
							blockOrigin={blockOrigin}
							blockData={blockData}
							handleDeleteBlock={handleDeleteBlock}
							setBlockOrigin={setBlockOrigin}
							setShowContextualMenu={setShowContextualMenu}
							handleNewRelation={handleNewRelation}
							EnableEditPreconditions={true}
							EnableCreateRelation={true}
							EnableCut={true}
							EnableCopy={true}
							EnableDelete={true}
						/>
					)}
					{contextMenuOrigin == "nodesselection" && (
						<CMSelectionMenu
							handleDeleteBlockSelection={handleDeleteBlockSelection}
							EnableCreateFragment={true}
							EnableCut={true}
							EnableCopy={true}
							EnableDelete={true}
						/>
					)}
				</div>
			)}
		</>
	);
}
const BlockContextualMenuWithRef = forwardRef(ContextualMenu);
export default BlockContextualMenuWithRef;
