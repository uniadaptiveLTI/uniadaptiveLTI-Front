import styles from "@components/styles/BlockContextualMenu.module.css";
import { forwardRef, useContext, useState, useLayoutEffect } from "react";
import {
	BlocksDataContext,
	ExpandedAsideContext,
} from "@components/pages/_app";
import { BlockOriginContext } from "./BlockCanvas";
import CMBlockMenu from "./flow/contextualmenu/CMBlockMenu";
import CMPaneMenu from "./flow/contextualmenu/CMPaneMenu";
import CMSelectionMenu from "./flow/contextualmenu/CMSelectionMenu";
import { getBlocksByNodesDOM } from "./Utils";

export default forwardRef(function ContextualMenu(
	{
		x,
		y,
		showContextualMenu,
		blockData,
		setShowContextualMenu,
		contextMenuOrigin,
		containsReservedNodes,
		handleBlockCopy,
		handleBlockPaste,
		createBlock,
		handleNewRelation,
		handleBlockCut,
		handleDeleteBlock,
		handleDeleteBlockSelection,
		handleShow,
	},
	ref
) {
	const { blockOrigin, setBlockOrigin } = useContext(BlockOriginContext);
	const { currentBlocksData, setCurrentBlocksData } =
		useContext(BlocksDataContext);
	const { expanded: expandedAside } = useContext(ExpandedAsideContext);

	const asideBounds = expandedAside
		? document.getElementsByTagName("aside")[0]?.getBoundingClientRect()
		: 0;

	const [enableEditPreconditions, setEnableEditPreconditions] = useState(true);
	const [enableCreateRelation, setEnableCreateRelation] = useState(true);
	const [enableCreateFragment, setEnableCreateFragment] = useState(true);
	const [enableCut, setEnableCut] = useState(true);
	const [enableCopy, setEnableCopy] = useState(true);
	const [enablePaste, setEnablePaste] = useState(true);
	const [enableCreate, setEnableCreate] = useState(true);
	const [enableDelete, setEnableDelete] = useState(true);

	useLayoutEffect(() => {
		if (containsReservedNodes) {
			setEnableEditPreconditions(false);
			setEnableCreateFragment(false);
			setEnableDelete(false);
			setEnableCut(false);
			setEnableCopy(false);
		} else {
			setEnableDelete(true);
			setEnableCut(true);
			setEnableCopy(true);

			if (blockData) {
				if (Array.isArray(blockData)) {
					const blocks = getBlocksByNodesDOM(
						blockData,
						reactFlowInstance.getNodes()
					);
					const fragment = blocks.find((block) => block.type == "fragment");
					if (fragment) {
						setEnableCreateFragment(false);
					} else {
						setEnableCreateFragment(true);
					}
				}
			}
		}
	}, [blockData]);

	return (
		<>
			{showContextualMenu && (
				<>
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
								handleBlockPaste={handleBlockPaste}
								EnableCreate={enableCreate}
								EnablePaste={enablePaste}
							/>
						)}
						{contextMenuOrigin == "block" && (
							<CMBlockMenu
								handleShow={handleShow}
								blockOrigin={blockOrigin}
								blockData={blockData}
								setBlockOrigin={setBlockOrigin}
								setShowContextualMenu={setShowContextualMenu}
								handleDeleteBlock={handleDeleteBlock}
								handleNewRelation={handleNewRelation}
								handleBlockCopy={handleBlockCopy}
								handleBlockCut={handleBlockCut}
								EnableEditPreconditions={enableEditPreconditions}
								EnableCreateRelation={enableCreateRelation}
								EnableCut={enableCut}
								EnableCopy={enableCopy}
								EnableDelete={enableDelete}
							/>
						)}
						{contextMenuOrigin == "nodesselection" && (
							<CMSelectionMenu
								handleDeleteBlockSelection={handleDeleteBlockSelection}
								handleBlockCut={handleBlockCut}
								handleBlockCopy={handleBlockCopy}
								blocksData={blockData}
								EnableCreateFragment={enableCreateFragment}
								EnableCut={enableCut}
								EnableCopy={enableCopy}
								EnableDelete={enableDelete}
							/>
						)}
					</div>
				</>
			)}
		</>
	);
});
