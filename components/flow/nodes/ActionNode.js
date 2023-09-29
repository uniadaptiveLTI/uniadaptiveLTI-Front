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
import { DevModeStatusContext } from "pages/_app";
import { NodeTypes } from "@utils/TypeDefinitions";
import SimpleConditionsMoodle from "@components/flow/conditions/SimpleConditionsMoodle";
import SimpleConditionsSakai from "@components/flow/conditions/SimpleConditionsSakai";
import { useEffect } from "react";

const getHumanDesc = (type) => {
	const node = NodeTypes.find((node) => node.type == type);
	let humanType = "";
	if (node) {
		humanType = node.name;
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
	const { devModeStatus } = useContext(DevModeStatusContext);

	const reactFlowInstance = useReactFlow();
	const { settings } = useContext(SettingsContext);
	const [isHovered, setIsHovered] = useState(false);
	const parsedSettings = JSON.parse(settings);
	const { highContrast, reducedAnimations } = parsedSettings;
	const { platform } = useContext(PlatformContext);
	const rfNodes = useNodes();

	const [hasExtraConditions, setHasExtraConditions] = useState(
		getNumberOfIndependentConditions(getNodeById(id, rfNodes)) > 1
	);

	const handleEdit = () => {
		const blockData = getNodeById(id, reactFlowInstance.getNodes());
		if (expandedAside != true) {
			setExpandedAside(true);
		}
		setEditVersionSelected("");
		setNodeSelected(blockData);
	};

	const extractSelf = () => {
		const fragment = getNodeById(
			getNodeById(id, reactFlowInstance.getNodes()).parentNode,
			reactFlowInstance
		);
		const childToRemove = getNodeById(id, reactFlowInstance.getNodes());

		delete childToRemove.parentNode;
		delete childToRemove.expandParent;
		childToRemove.position = childToRemove.positionAbsolute;

		fragment.data.innerNodes = fragment.data.innerNodes.filter(
			(node) => node.id != childToRemove.id
		);
		fragment.zIndex = -1;
		reactFlowInstance.setNodes(
			getUpdatedArrayById(fragment, [
				...reactFlowInstance
					.getNodes()
					.filter((node) => childToRemove.id != node.id),
				childToRemove,
			])
		);
	};

	useEffect(() => {
		setHasExtraConditions(
			getNumberOfIndependentConditions(getNodeById(id, rfNodes)) > 0
		);
	}, [JSON.stringify(data?.c)]);

	return (
		<>
			{isHovered && selected && !dragging && platform == "moodle" && (
				<div className={styles.hovedConditions}>
					<SimpleconditionsMoodle id={id} />
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
			{getNodeById(id, reactFlowInstance.getNodes()).parentNode && (
				<NodeToolbar position="left" offset={25}>
					<FocusTrap
						focusTrapOptions={{
							clickOutsideDeactivates: true,
							returnFocusOnDeactivate: true,
						}}
					>
						<div className={styles.blockToolbar}>
							<Button
								variant="dark"
								onClick={extractSelf}
								title="Sacar del fragmento"
							>
								<FontAwesomeIcon icon={faRightFromBracket} />
								<span className="visually-hidden">Sacar del fragmento</span>
							</Button>
						</div>
					</FocusTrap>
				</NodeToolbar>
			)}
			<div
				id={id}
				className={
					"block " +
					styles.container +
					" " +
					(highContrast && styles.highContrast + " highContrast ") +
					" " +
					(reducedAnimations && styles.noAnimation + " noAnimation")
				}
				aria-label={getAriaLabel} //FIXME: Doesn't work
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
				onClick={handleEdit}
				onKeyDown={(e) => {
					if (e.key == "Enter") handleEdit();
				}}
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
