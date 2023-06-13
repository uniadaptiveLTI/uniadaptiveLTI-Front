import { forwardRef, useContext } from "react";
import { Modal, Button, Container, Col, Row } from "react-bootstrap";
import { PlatformContext } from "@root/pages/_app";
import { NodeTypes } from "@utils/TypeDefinitions";
import {
	orderByPropertyAlphabetically,
	parseBool,
	uniqueId,
} from "@utils/Utils.js";
import { getTypeIcon, getTypeStaticColor } from "../../utils/NodeIcons";
import styles from "@root/styles/NodeSelector.module.css";
import { useNodes } from "reactflow";
import { getLastPositionInSection, getLowestSection } from "@utils/Nodes";

export default forwardRef(function NodeSelector(
	{ showDialog, type, toggleDialog, callback },
	ref
) {
	const rfNodes = useNodes();
	const { platform } = useContext(PlatformContext);
	function handleClose(actionClicked) {
		if (callback && actionClicked) {
			if (callback instanceof Function) {
				callback();
			} else {
				console.warn("Callback isn't a function");
			}
		}
		toggleDialog();
	}

	function getFilteredBlockSelection() {
		const lmsBlocks = NodeTypes.filter((node) => node.lms.includes(platform));
		const typeBlocks = lmsBlocks.filter((node) => node.nodeType == type);
		const orderedSelection = orderByPropertyAlphabetically(typeBlocks, "name");

		return (
			<div className={styles.selectionContainer}>
				{orderedSelection.map((selectedElement) =>
					SelectionElement(selectedElement)
				)}
			</div>
		);
	}

	function getMaxSectionFromSelection() {
		const selectedNodes = rfNodes.filter((node) => node.selected);
		let maxSection = 0;
		if (selectedNodes.length > 0) {
			maxSection = Math.max(...selectedNodes.map((node) => node.data.section));
		}
		return maxSection > -1 ? maxSection : getLowestSection(rfNodes); //TODO: Test in sakai
	}

	function SelectionElement(selectedElement) {
		const { nodeType, type, name } = selectedElement;

		const typeColor = getTypeStaticColor(type, platform);
		const typeIcon = getTypeIcon(type, platform, 32);
		const data = {};
		const section = getMaxSectionFromSelection();
		if (nodeType == "ElementNode") {
			data.label = name;
			data.children = [];
			data.section = section;
			data.order = getLastPositionInSection(section, rfNodes) + 1;
		} else {
			data.label = name;
		}
		return (
			<div key={type} className={styles.cardContainer + " nodeSelectionItem"}>
				<div
					className={styles.nodeCard}
					role="button"
					tabIndex={0}
					onClick={() => {
						callback({ id: uniqueId(), type: type, data: { ...data } });
						toggleDialog();
					}}
					onKeyDown={(e) => {
						if (e.code == "Enter") {
							callback({ id: uniqueId(), type: type, data: { ...data } });
							toggleDialog();
						}
					}}
				>
					<div className={styles.block} style={{ background: typeColor }}>
						{typeIcon}
					</div>
					<span>
						{parseBool(process.env.NEXT_PUBLIC_DEV_MODE) ? type : name}
					</span>
				</div>
			</div>
		);
	}
	return (
		<Modal show={showDialog} onHide={toggleDialog} centered>
			<Modal.Header closeButton>
				<Modal.Title>Selección de bloque</Modal.Title>
			</Modal.Header>
			<Modal.Body style={{ maxHeight: "60vh", overflowY: "scroll" }}>
				{getFilteredBlockSelection()}
			</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={toggleDialog}>
					Cancelar
				</Button>
			</Modal.Footer>
		</Modal>
	);
});
