import styles from "/styles/ContextualMenu.module.css";
import { forwardRef, useContext, useState, useLayoutEffect } from "react";
import { ExpandedAsideContext } from "/pages/_app";
import { useReactFlow } from "reactflow";
import CMNodeMenu from "./contextualmenu/CMNodeMenu";
import CMPaneMenu from "./contextualmenu/CMPaneMenu";
import CMSelectionMenu from "./contextualmenu/CMSelectionMenu";

export default forwardRef(function ContextualMenu(
	{
		x,
		y,
		setShowGradeConditionsModal,
		blockData,
		relationStarter,
		setRelationStarter,
		setShowContextualMenu,
		contextMenuOrigin,
		containsReservedNodes,
		createBlock,
		handleNodeCopy,
		handleNodePaste,
		handleShowNodeSelector,
		handleFragmentCreation,
		handleNewRelation,
		handleNodeCut,
		handleNodeDeletion,
		handleNodeSelectionDeletion,
		handleShow,
	},
	ref
) {
	const { expanded: expandedAside } = useContext(ExpandedAsideContext);

	const ASIDE_BOUNDS = expandedAside
		? document.getElementsByTagName("aside")[0]?.getBoundingClientRect()
		: 0;

	const [enableEditPreconditions, setEnableEditPreconditions] = useState(true);
	const [enableGradeConditions, setEnableGradeConditions] = useState(true);
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
			setEnableGradeConditions(false);
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
					const INVALID_NODES = blockData.filter(
						(node) => node.type == "fragment" || node.parentNode != undefined
					);
					if (INVALID_NODES.length > 0) {
						setEnableCreateFragment(false);
					} else {
						setEnableCreateFragment(true);
					}
				} else {
					setEnableGradeConditions(true); //TODO: Add conditions for grade conditions to appear
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
					left: `${x + (ASIDE_BOUNDS && ASIDE_BOUNDS.width)}px`,
				}}
				className={styles.cM + " "}
			>
				{contextMenuOrigin == "pane" && (
					<CMPaneMenu
						createBlock={createBlock}
						handleShowNodeSelector={handleShowNodeSelector}
						handleNodePaste={handleNodePaste}
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
						handleNodeDeletion={handleNodeDeletion}
						handleNewRelation={handleNewRelation}
						handleNodeCopy={handleNodeCopy}
						handleNodeCut={handleNodeCut}
						EnableEditPreconditions={enableEditPreconditions}
						EnableGradeConditions={enableGradeConditions}
						EnableCreateRelation={enableCreateRelation}
						EnableCut={enableCut}
						EnableCopy={enableCopy}
						EnableDelete={enableDelete}
					/>
				)}
				{contextMenuOrigin == "nodesselection" && (
					<CMSelectionMenu
						handleFragmentCreation={handleFragmentCreation}
						handleNodeSelectionDeletion={handleNodeSelectionDeletion}
						handleNodeCut={handleNodeCut}
						handleNodeCopy={handleNodeCopy}
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
