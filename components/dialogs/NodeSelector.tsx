import {
	forwardRef,
	useContext,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { Modal, Button, Container, Col, Row } from "react-bootstrap";
import {
	MoodleGradableTypes,
	NodeDeclarations,
	getGradableTypes,
} from "@utils/TypeDefinitions";
import {
	handleNameCollision,
	orderByPropertyAlphabetically,
	parseBool,
	uniqueId,
} from "@utils/Utils";
import { getTypeIcon, getTypeStaticColor } from "../../utils/NodeIcons";
import styles from "/styles/NodeSelector.module.css";
import { useNodes } from "reactflow";
import { getLastPositionInSection, getLowestSection } from "@utils/Nodes";
import {
	Platforms,
	getDefaultVisibility,
	startingSectionID,
} from "@utils/Platform";
import { MetaDataContext } from "pages/_app";
import {
	IElementNodeData,
	INode,
	INodeData,
} from "@components/interfaces/INode";

interface NodeSelectorProps {
	showDialog: boolean;
	toggleDialog: () => void;
	type: string;
	callback: (prop) => {};
}

export default function NodeSelector({
	showDialog,
	type,
	toggleDialog,
	callback,
}: NodeSelectorProps) {
	const { metaData } = useContext(MetaDataContext);
	const modalRef = useRef(null);
	const rfNodes = useNodes() as Array<INode>;
	const [widthStyle, setWidthStyle] = useState(styles.selectionContainer);

	useLayoutEffect(() => {
		if (modalRef.current) {
			rescaleGrid();
		}
	}, [modalRef.current]);

	useEffect(() => {
		rescaleGrid();
	}, [modalRef.current?.getBoundingClientRect()]);

	function rescaleGrid() {
		const MODAL_BOUNDS = modalRef.current.getBoundingClientRect();
		const MODAL_WIDTH = MODAL_BOUNDS.width;
		let styleToLoad = null;
		if (MODAL_WIDTH < 499) styleToLoad = styles.selectionContainer;
		if (MODAL_WIDTH >= 499 && MODAL_WIDTH < 799)
			styleToLoad = styles.selectionContainerMD;
		if (MODAL_WIDTH >= 799) styleToLoad = styles.selectionContainerXL;
		setWidthStyle(styleToLoad);
	}

	function getFilteredBlockSelection() {
		const LMS_BLOCKS = NodeDeclarations.filter((node) =>
			node.lms.includes(metaData.platform)
		);
		const TYPE_BLOCKS = LMS_BLOCKS.filter((node) => node.nodeType == type);
		const ORDERED_SELECTION = orderByPropertyAlphabetically(
			TYPE_BLOCKS,
			"name"
		);

		return (
			<div className={widthStyle}>
				{ORDERED_SELECTION.map((selectedElement) =>
					SelectionElement(selectedElement)
				)}
			</div>
		);
	}

	function getMaxSectionFromSelection() {
		const SELECTED_NODES = rfNodes.filter(
			(node) => node.selected
		) as Array<INode>;
		let maxSection = 0;
		if (SELECTED_NODES.length > 0) {
			maxSection = Math.max(
				...SELECTED_NODES.map((node) => {
					if ("section" in node.data) return node.data.section;
				})
			);
		}
		return maxSection > -1 ? maxSection : getLowestSection(rfNodes); //TODO: Test in sakai
	}

	function SelectionElement(selectedElement) {
		const { nodeType, type, name } = selectedElement;

		const TYPE_COLOR = getTypeStaticColor(type, metaData.platform);
		const TYPE_ICON = getTypeIcon(type, metaData.platform, 32);
		interface newNodeData {
			label: IElementNodeData["label"];
			children: IElementNodeData["children"];
			section: IElementNodeData["section"];
			order: IElementNodeData["order"];
			indent: IElementNodeData["indent"];
			lmsVisibility: IElementNodeData["lmsVisibility"];
			g?: IElementNodeData["g"];
		}
		const DATA: newNodeData = {
			label: "",
			children: [],
			section: 0,
			order: 0,
			indent: 0,
			lmsVisibility: "show_unconditionally",
		};
		const SECTION = getMaxSectionFromSelection();
		if (nodeType == "ElementNode") {
			DATA.label = handleNameCollision(
				NodeDeclarations.find((ntype) => type == ntype.type).emptyName,
				rfNodes.map((node) => node?.data?.label),
				false,
				"("
			);

			DATA.children = [];
			DATA.section =
				SECTION == undefined || SECTION == Infinity || SECTION == -Infinity
					? startingSectionID(metaData.platform)
					: SECTION;
			DATA.order = getLastPositionInSection(SECTION, rfNodes) + 1;
			DATA.lmsVisibility = getDefaultVisibility(metaData.platform);
			DATA.indent = 0;
			if (
				metaData.platform == Platforms.Moodle &&
				getGradableTypes(Platforms.Moodle).includes(type)
			)
				DATA.g = {
					hasConditions: false,
					hasToBeSeen: false,
					hasToBeQualified: false,
					data: {
						min: 0,
						max: type == "quiz" ? 10 : 100,
						hasToSelect: false,
					},
				};
		} else {
			DATA.label = name;
		}
		return (
			<div key={type} className={styles.cardContainer + " nodeSelectionItem"}>
				<div
					className={styles.nodeCard}
					role="button"
					tabIndex={0}
					onClick={() => {
						callback({
							id: uniqueId(),
							type: type,
							height: 68,
							width: 68,
							data: { ...DATA },
						});
						toggleDialog();
					}}
					onKeyDown={(e) => {
						if (e.code == "Enter") {
							callback({
								id: uniqueId(),
								type: type,
								height: 68,
								width: 68,
								data: { ...DATA },
							});
							toggleDialog();
						}
					}}
				>
					<div className={styles.block} style={{ background: TYPE_COLOR }}>
						{TYPE_ICON}
					</div>
					<span>
						{parseBool(process.env.NEXT_PUBLIC_DEV_MODE) ? type : name}
					</span>
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
}
