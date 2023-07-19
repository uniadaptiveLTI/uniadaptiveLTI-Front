import {
	forwardRef,
	useContext,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
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
import { getDefaultVisibility, startingSectionID } from "@utils/Platform";
import { DevModeStatusContext } from "pages/_app";

export default forwardRef(function NodeSelector(
	{ showDialog, type, toggleDialog, callback },
	ref
) {
	const modalRef = useRef(null);
	const rfNodes = useNodes();
	const { platform } = useContext(PlatformContext);
	const { devModeStatus } = useContext(DevModeStatusContext);
	const [widthStyle, setWidthStyle] = useState(styles.selectionContainer);
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

	useLayoutEffect(() => {
		if (modalRef.current) {
			rescaleGrid();
		}
	}, [modalRef.current]);

	useEffect(() => {
		rescaleGrid();
	}, [modalRef.current?.getBoundingClientRect()]);

	function rescaleGrid() {
		const modalBounds = modalRef.current.getBoundingClientRect();
		const mwidth = modalBounds.width;
		let styleToLoad = null;
		if (mwidth < 499) styleToLoad = styles.selectionContainer;
		if (mwidth >= 499 && mwidth < 799)
			styleToLoad = styles.selectionContainerMD;
		if (mwidth >= 799) styleToLoad = styles.selectionContainerXL;
		setWidthStyle(styleToLoad);
	}

	function getFilteredBlockSelection() {
		const lmsBlocks = NodeTypes.filter((node) => node.lms.includes(platform));
		const typeBlocks = lmsBlocks.filter((node) => node.nodeType == type);
		const orderedSelection = orderByPropertyAlphabetically(typeBlocks, "name");

		return (
			<div className={widthStyle}>
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
			data.label = "Vacío";
			data.children = [];
			data.section =
				section == undefined ? startingSectionID(platform) : section;
			data.order = getLastPositionInSection(section, rfNodes) + 1;
			data.lmsVisibility = getDefaultVisibility(platform);
			data.identation = 0;
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
					<span>{devModeStatus ? type : name}</span>
				</div>
			</div>
		);
	}
	return (
		<Modal show={showDialog} onHide={toggleDialog} size="lg" centered>
			<Modal.Header closeButton>
				<Modal.Title>Selección de bloque</Modal.Title>
			</Modal.Header>
			<Modal.Body
				ref={modalRef}
				style={{ maxHeight: "60vh", overflowY: "auto" }}
			>
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
