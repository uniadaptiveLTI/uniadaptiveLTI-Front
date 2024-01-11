import { useCallback, useContext, useState } from "react";
import {
	Handle,
	Position,
	NodeToolbar,
	useReactFlow,
	useNodes,
} from "reactflow";
import styles from "/styles/BlockContainer.module.css";
import {
	NodeInfoContext,
	ExpandedAsideContext,
	MapInfoContext,
	SettingsContext,
	VersionInfoContext,
	PlatformContext,
} from "/pages/_app";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faEdit,
	faRightFromBracket,
	faExclamation,
	faPlus,
} from "@fortawesome/free-solid-svg-icons";
import FocusTrap from "focus-trap-react";
import { Button, Badge } from "react-bootstrap";
import { getTypeIcon } from "@utils/NodeIcons";
import { getUpdatedArrayById, parseBool } from "@utils/Utils";
import { getNodeById, getNumberOfIndependentConditions } from "@utils/Nodes";

import { NodeTypes } from "@utils/TypeDefinitions";
import SimpleConditionsMoodle from "@components/flow/conditions/SimpleConditionsMoodle";
import SimpleConditionsSakai from "@components/flow/conditions/SimpleConditionsSakai";
import { useEffect } from "react";

const getHumanDesc = (type) => {
	const NODE = NodeTypes.find((node) => node.type == type);
	let humanType = "";
	if (NODE) {
		humanType = NODE.name;
	} else {
		humanType = "Acción";
	}
	return humanType;
};

const getAriaLabel = () => {
	/*
	let end = blockData.section
		? ", forma parte de la sección " +
		  blockData.section +
		  ", calculado desde su identación."
		: ".";*/
	return (
		getHumanDesc() +
		", " +
		blockData.label +
		", posición en el eje X: " +
		blockData.x +
		", posición en el eje Y: " +
		blockData.y +
		end
	);
};

function ActionNode({ id, type, data, selected, dragging, isConnectable }) {
	const onChange = useCallback((evt) => {
		//console.log(evt.target.value);
	}, []);

	const { expandedAside, setExpandedAside } = useContext(ExpandedAsideContext);
	const { nodeSelected, setNodeSelected } = useContext(NodeInfoContext);
	const { mapSelected, setMapSelected } = useContext(MapInfoContext);
	const { editVersionSelected, setEditVersionSelected } =
		useContext(VersionInfoContext);

	const reactFlowInstance = useReactFlow();
	const { settings } = useContext(SettingsContext);
	const [isHovered, setIsHovered] = useState(false);
	const PARSED_SETTINGS = JSON.parse(settings);
	const { highContrast, reducedAnimations } = PARSED_SETTINGS;
	const { platform } = useContext(PlatformContext);
	const rfNodes = useNodes();

	const [hasExtraConditions, setHasExtraConditions] = useState(
		getNumberOfIndependentConditions(getNodeById(id, rfNodes)) > 1
	);

	const handleEdit = () => {
		const BLOCKDATA = getNodeById(id, reactFlowInstance.getNodes());
		if (expandedAside != true) {
			setExpandedAside(true);
		}
		setEditVersionSelected("");
		setNodeSelected(BLOCKDATA);
	};

	const extractSelf = () => {
		const FRAGMENT = getNodeById(
			getNodeById(id, reactFlowInstance.getNodes()).parentNode,
			reactFlowInstance
		);
		const CHILD_TO_REMOVE = getNodeById(id, reactFlowInstance.getNodes());

		delete CHILD_TO_REMOVE.parentNode;
		delete CHILD_TO_REMOVE.expandParent;
		CHILD_TO_REMOVE.position = CHILD_TO_REMOVE.positionAbsolute;

		FRAGMENT.data.innerNodes = FRAGMENT.data.innerNodes.filter(
			(node) => node.id != CHILD_TO_REMOVE.id
		);
		FRAGMENT.zIndex = -1;
		reactFlowInstance.setNodes(
			getUpdatedArrayById(FRAGMENT, [
				...reactFlowInstance
					.getNodes()
					.filter((node) => CHILD_TO_REMOVE.id != node.id),
				CHILD_TO_REMOVE,
			])
		);
	};

	useEffect(() => {
		setHasExtraConditions(
			getNumberOfIndependentConditions(getNodeById(id, rfNodes)) > 0
		);
	}, [JSON.stringify(data?.c)]);

	const shouldApplyAnimation =
		nodeSelected && nodeSelected.id === id && expandedAside;

	const containerClassName = !reducedAnimations
		? styles.nodeSelected
		: styles.nodeSelectedNoAnimated;

	return (
		<>
			{isHovered && selected && !dragging && platform == "moodle" && (
				<div className={styles.hovedConditions}>
					<SimpleConditionsMoodle id={id} />
				</div>
			)}
			{isHovered && selected && !dragging && platform == "sakai" && (
				<div className={styles.hovedConditions}>
					<SimpleConditionsSakai id={id} />
				</div>
			)}
			<Handle
				type="target"
				position={Position.Left}
				isConnectable={isConnectable}
				isConnectableStart="false"
			/>
			<NodeToolbar position="left" offset={25}>
				<FocusTrap
					focusTrapOptions={{
						clickOutsideDeactivates: true,
						returnFocusOnDeactivate: true,
					}}
				>
					<div className={styles.blockToolbar}>
						<Button variant="dark" onClick={handleEdit} title="Editar elemento">
							<FontAwesomeIcon icon={faEdit} />
							<span className="visually-hidden">Editar elemento</span>
						</Button>
						{getNodeById(id, reactFlowInstance.getNodes()).parentNode && (
							<Button
								variant="dark"
								onClick={extractSelf}
								title="Sacar del fragmento"
							>
								<FontAwesomeIcon icon={faRightFromBracket} />
								<span className="visually-hidden">Sacar del fragmento</span>
							</Button>
						)}
					</div>
				</FocusTrap>
			</NodeToolbar>
			<div
				id={id}
				className={
					"block " +
					styles.container +
					" " +
					(highContrast && styles.highContrast + " highContrast ") +
					" " +
					(shouldApplyAnimation && containerClassName)
				}
				aria-label={getAriaLabel} //FIXME: Doesn't work
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
				onClick={(e) => {
					if (e.detail === 2) {
						handleEdit();
					}
				}}
				onKeyDown={(e) => {
					if (e.key == "Enter") handleEdit();
				}}
				tabIndex={0}
			>
				<span className={styles.blockInfo + " " + styles.top}>
					{data.label}
				</span>
				<div>{getTypeIcon(type, platform)}</div>
				<span className={styles.blockInfo + " " + styles.bottom}>
					{getHumanDesc(type)}
				</span>
				{hasExtraConditions && (
					<Badge
						bg="success"
						className={
							styles.badge +
							" " +
							styles.badgeConditions +
							" " +
							(reducedAnimations && styles.noAnimation) +
							" " +
							styles.showBadges +
							" " +
							(highContrast && styles.highContrast)
						}
						title="Contiene condiciones independientes"
					>
						{<FontAwesomeIcon icon={faPlus} style={{ color: "#ffffff" }} />}
					</Badge>
				)}
				{data.lmsResource == undefined && (
					<Badge
						bg="danger"
						className={
							styles.badge +
							" " +
							styles.badgeError +
							" " +
							(reducedAnimations && styles.noAnimation) +
							" " +
							styles.showBadges +
							" " +
							(highContrast && styles.highContrast)
						}
						title="Sección"
					>
						{
							<FontAwesomeIcon
								icon={faExclamation}
								style={{ color: "#ffffff" }}
							/>
						}
					</Badge>
				)}
			</div>
		</>
	);
}

export default ActionNode;
