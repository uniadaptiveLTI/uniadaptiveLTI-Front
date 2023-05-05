import { useCallback, useContext, useState } from "react";
import { Handle, Position, useEdges } from "reactflow";
import { Badge } from "react-bootstrap";
import styles from "@components/styles/BlockContainer.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCubes } from "@fortawesome/free-solid-svg-icons";
import {
	BlockInfoContext,
	BlocksDataContext,
	MapInfoContext,
	ReactFlowInstanceContext,
	SettingsContext,
	VersionInfoContext,
} from "@components/pages/_app";
import { useEffect } from "react";
import {
	getBlockByNode,
	getEdgeBetweenNodeIds,
	getNodesByProperty,
	getUpdatedBlocksData,
} from "@components/components/Utils";

function FragmentNode({ id, xPos, yPos, type, data }) {
	const onChange = useCallback((evt) => {
		//console.log(evt.target.value);
	}, []);

	const { blockSelected, setBlockSelected } = useContext(BlockInfoContext);
	const { mapSelected, setMapSelected } = useContext(MapInfoContext);
	const { selectedEditVersion, setSelectedEditVersion } =
		useContext(VersionInfoContext);
	const { reactFlowInstance } = useContext(ReactFlowInstanceContext);
	const { currentBlocksData, setCurrentBlocksData } =
		useContext(BlocksDataContext);
	const { settings, setSettings } = useContext(SettingsContext);
	const parsedSettings = JSON.parse(settings);
	const { highContrast, showDetails, reducedAnimations } = parsedSettings;
	const [originalChildrenStatus, setOriginalChildrenStatus] = useState(
		data.innerNodes
	);
	const [expanded, setExpanded] = useState(data.expanded);

	const handleClick = () => {
		const blockData = {
			id: id,
			x: xPos,
			y: yPos,
			type: type,
			title: data.label,
			children: data.children,
		};
		//console.log(blockData);

		setSelectedEditVersion("");
		setBlockSelected(blockData);
	};

	const handleDoubleClick = () => {
		console.log("dobleclick");
		data.expanded = !expanded;
		setExpanded(!expanded);
	};

	const findChildren = () => {
		return getNodesByProperty(reactFlowInstance, "parentNode", id);
	};

	useEffect(() => {
		const children = findChildren();
		console.log(expanded);

		if (children) {
			for (const [index, childNode] of children.entries()) {
				const nodeDOM = document.querySelector(
					"[data-id=" + childNode.id + "]"
				);

				if (!expanded) {
					nodeDOM.classList.add("insideContractedFragment");
					const newBlock = getBlockByNode(nodeDOM, currentBlocksData);
					newBlock.x = 0;
					newBlock.y = 0;
					setCurrentBlocksData(
						getUpdatedBlocksData(newBlock, currentBlocksData)
					);
				} else {
					nodeDOM.classList.remove("insideContractedFragment");
					const newBlock = getBlockByNode(nodeDOM, currentBlocksData);
					newBlock.x = originalChildrenStatus[index].x;
					newBlock.y = originalChildrenStatus[index].y;
					setCurrentBlocksData(
						getUpdatedBlocksData(newBlock, currentBlocksData)
					);
				}
			}

			for (const childNode1 of children) {
				const childId1 = childNode1.id;
				for (const childNode2 of children) {
					const childId2 = childNode2.id;
					const edge = getEdgeBetweenNodeIds(
						childId1,
						childId2,
						reactFlowInstance
					);
					if (edge) {
						//Timeout so the edges get the time to generate
						setTimeout(() => {
							const edgeDOM = document.querySelector(
								"[data-testid=rf__edge-" + edge.id + "]"
							);
							if (edgeDOM) {
								if (!expanded) {
									edgeDOM.style.visibility = "hidden";
								} else {
									edgeDOM.style.visibility = "visible";
								}
							}
						}, 10);
					}
				}
			}
		}
	}, [expanded]);

	const getAriaLabel = () => {
		let end = "";
		if (data.unit && data.order) {
			end = data.unit
				? ", forma parte de la unidad " +
				  data.unit +
				  ", con la posición " +
				  data.order +
				  "en el LMS."
				: ".";
		}
		return (
			"Fragmento, " +
			data.title +
			", posición en el eje X: " +
			xPos +
			", posición en el eje Y: " +
			yPos +
			end
		);
	};

	return (
		<>
			<div
				id={id}
				className={
					"block " +
					styles.container +
					" " +
					(highContrast && styles.highContrast + " highContrast ") +
					" " +
					(reducedAnimations && styles.noAnimation + " noAnimation") +
					" " +
					(expanded && "expandedFragment")
				}
				onClick={(e) => {
					if (e.detail === 1) handleClick();
					if (e.detail === 2) handleDoubleClick();
				}}
				aria-label={getAriaLabel} //FIXME: Doesn't work
				style={
					expanded
						? {
								height: data.style.height + 122,
								width: data.style.width + 64,
						  }
						: {}
				}
			>
				{!expanded && (
					<span className={styles.blockInfo + " " + styles.top}>
						{data.label}
					</span>
				)}
				<div>
					<FontAwesomeIcon icon={faCubes} />
				</div>
				{!expanded && (
					<span className={styles.blockInfo + " " + styles.bottom}>
						Fragmento
					</span>
				)}
			</div>
		</>
	);
}

export default FragmentNode;
