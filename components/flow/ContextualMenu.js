import styles from "@components/styles/ContextualMenu.module.css";
import { forwardRef, useContext, useState, useLayoutEffect } from "react";
import { ExpandedAsideContext } from "@components/pages/_app";
import { useReactFlow } from "reactflow";
import CMNodeMenu from "./contextualmenu/CMNodeMenu";
import CMPaneMenu from "./contextualmenu/CMPaneMenu";
import CMSelectionMenu from "./contextualmenu/CMSelectionMenu";

export default forwardRef(function ContextualMenu(
	{
		x,
		y,
		showContextualMenu,
		blockData,
		relationStarter,
		setRelationStarter,
		setShowContextualMenu,
		contextMenuOrigin,
		containsReservedNodes,
		createBlock,
		handleBlockCopy,
		handleBlockPaste,
		handleShowNodeSelector,
		handleFragmentCreation,
		handleNewRelation,
		handleBlockCut,
		handleDeleteBlock,
		handleDeleteBlockSelection,
		handleShow,
	},
	ref
) {
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
					const invalidNodes = blockData.filter(
						(node) => node.type == "fragment" || node.parentNode != undefined
					);
					if (invalidNodes.length > 0) {
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
						handleShowNodeSelector={handleShowNodeSelector}
						handleBlockPaste={handleBlockPaste}
						EnableCreate={enableCreate}
						EnablePaste={enablePaste}
					/>
				)}
				{contextMenuOrigin == "block" && (
					<CMNodeMenu
						handleShow={handleShow}
						relationStarter={relationStarter}
						blockData={blockData}
						setRelationStarter={setRelationStarter}
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
						handleFragmentCreation={handleFragmentCreation}
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
	);
});