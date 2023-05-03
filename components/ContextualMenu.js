import styles from "@components/styles/BlockContextualMenu.module.css";
import { forwardRef, useContext } from "react";
import { ExpandedContext } from "@components/pages/_app";
import { BlockOriginContext } from "./BlockCanvas";
import CMBlockMenu from "./flow/contextualmenu/CMBlockMenu";
import CMPaneMenu from "./flow/contextualmenu/CMPaneMenu";
import CMSelectionMenu from "./flow/contextualmenu/CMSelectionMenu";

export default forwardRef(function ContextualMenu(
	{
		x,
		y,
		showContextualMenu,
		blockData,
		setShowContextualMenu,
		setShowConditionsModal,
		contextMenuOrigin,
		containsReservedNodes,
		handleBlockCopy,
		handleBlockPaste,
		createBlock,
		handleNewRelation,
		handleBlockCut,
		handleDeleteBlock,
		handleDeleteBlockSelection,
	},
	ref
) {
	const { blockOrigin, setBlockOrigin } = useContext(BlockOriginContext);

	const { expanded } = useContext(ExpandedContext);

	const handleShow = () => {
		setShowConditionsModal(true);
		setShowContextualMenu(false);
	};

	const asideBounds = expanded
		? document.getElementsByTagName("aside")[0]?.getBoundingClientRect()
		: 0;

	return (
		<>
			{showContextualMenu && (
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
									setBlockOrigin={setBlockOrigin}
									setShowContextualMenu={setShowContextualMenu}
									handleDeleteBlock={handleDeleteBlock}
									handleNewRelation={handleNewRelation}
									handleBlockCopy={handleBlockCopy}
									handleBlockCut={handleBlockCut}
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
									handleBlockCut={handleBlockCut}
									handleBlockCopy={handleBlockCopy}
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
									handleBlockPaste={handleBlockPaste}
									EnableCreate={true}
									EnablePaste={true}
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
									handleBlockCut={handleBlockCut}
									handleBlockCopy={handleBlockCopy}
									EnableCreateFragment={true}
									EnableCut={true}
									EnableCopy={true}
									EnableDelete={true}
								/>
							)}
						</div>
					)}
				</>
			)}
		</>
	);
});
