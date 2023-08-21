import { useCallback, useContext, useEffect } from "react";
import {
	Handle,
	Position,
	NodeToolbar,
	useReactFlow,
	useNodes,
} from "reactflow";
import { Badge, Button } from "react-bootstrap";
import styles from "@root/styles/BlockContainer.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faEdit,
	faRightFromBracket,
	faEye,
	faEyeSlash,
	faExclamation,
	faExclamationTriangle,
	faPlus,
} from "@fortawesome/free-solid-svg-icons";
import {
	NodeInfoContext,
	ExpandedAsideContext,
	MapInfoContext,
	SettingsContext,
	VersionInfoContext,
	PlatformContext,
	ErrorListContext,
} from "@root/pages/_app";
import FocusTrap from "focus-trap-react";
import { getTypeIcon } from "@utils/NodeIcons";
import { getUpdatedArrayById, parseBool } from "@utils/Utils";
import {
	getNodeById,
	getNumberOfIndependentConditions,
	getPrimaryConditionType,
} from "@utils/Nodes";
import { useState } from "react";
import { NodeTypes } from "@utils/TypeDefinitions";
import SimpleConditions from "@components/flow/conditions/SimpleConditions";
import { getConditionIcon } from "@utils/ConditionIcons";

function ElementNode({
	id,
	xPos,
	yPos,
	type,
	data,
	selected,
	dragging,
	isConnectable,
}) {
	const onChange = useCallback((evt) => {
		//console.log(evt.target.value);
	}, []);

	const { expandedAside, setExpandedAside } = useContext(ExpandedAsideContext);
	const { nodeSelected, setNodeSelected } = useContext(NodeInfoContext);
	const { mapSelected, setMapSelected } = useContext(MapInfoContext);
	const { editVersionSelected, setEditVersionSelected } =
		useContext(VersionInfoContext);
	const { platform } = useContext(PlatformContext);
	const { errorList } = useContext(ErrorListContext);
	const { settings, setSettings } = useContext(SettingsContext);
	const reactFlowInstance = useReactFlow();
	const parsedSettings = JSON.parse(settings);
	const { highContrast, showDetails, reducedAnimations } = parsedSettings;
	const [hasErrors, setHasErrors] = useState(false);
	const [hasWarnings, setHasWarnings] = useState(false);
	const [isHovered, setIsHovered] = useState(false);
	const rfNodes = useNodes();
	const [hasExtraConditions, setHasExtraConditions] = useState(
		getNumberOfIndependentConditions(getNodeById(id, rfNodes)) > 0
	);

	const getParentExpanded = () => {
		const nodes = rfNodes;
		const parentID = getNodeById(id, nodes).parentNode;

		if (parentID) {
			//If is part of a fragment
			const parent = getNodeById(parentID, nodes);

			return parent.data.expanded;
		} else {
			//Treat as expanded
			return true;
		}
	};

	const handleEdit = () => {
		const blockData = getNodeById(id, reactFlowInstance.getNodes());
		if (expandedAside != true) {
			setExpandedAside(true);
		}
		setEditVersionSelected("");
		setNodeSelected(blockData);
	};

	const getAriaLabel = () => {
		let end = "";
		if (data.section && data.order) {
			end = data.section
				? ", forma parte de la sección " +
				  data.section +
				  ", con la posición " +
				  data.order +
				  "en el LMS."
				: ".";
		}
		return (
			getHumanDesc() +
			", " +
			data.label +
			", posición en el eje X: " +
			xPos +
			", posición en el eje Y: " +
			yPos +
			end
		);
	};

	const getHumanDesc = (type) => {
		const node = NodeTypes.find((node) => node.type == type);
		let humanType = "";
		if (node) {
			humanType = node.name;
		} else {
			humanType = "Elemento";
		}
		return humanType;
	};

	const extractSelf = () => {
		const fragment = getNodeById(
			getNodeById(id, reactFlowInstance.getNodes()).parentNode,
			reactFlowInstance.getNodes()
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

	const getSelfErrors = () => {
		const relatedErrors = errorList.filter((error) => error.nodeId == id);
		const errors = relatedErrors.filter(
			(rerrors) => rerrors.severity == "error"
		);
		const warnings = relatedErrors.filter(
			(rerrors) => rerrors.severity == "warning"
		);
		setHasErrors(errors.length > 0);
		setHasWarnings(warnings.length > 0);
	};

	useEffect(() => {
		getSelfErrors();
	}, [data]);

	useEffect(() => {
		setHasExtraConditions(
			getNumberOfIndependentConditions(getNodeById(id, rfNodes)) > 0
		);
	}, [JSON.stringify(data?.c)]);

	return (
		<>
			{isHovered && selected && !dragging && (
				<div className={styles.hovedConditions}>
					<SimpleConditions id={id} />
				</div>
			)}
			<Handle
				type="target"
				position={Position.Left}
				isConnectable={isConnectable}
				isConnectableStart="false"
			/>
			<Handle
				type="source"
				position={Position.Right}
				isConnectable={isConnectable}
				isConnectableEnd="false"
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
					(reducedAnimations && styles.noAnimation + " noAnimation")
				}
				aria-label={getAriaLabel} //FIXME: Doesn't work
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
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
						{getConditionIcon(
							getPrimaryConditionType(getNodeById(id, rfNodes)),
							{ color: "#ffffff" }
						)}
					</Badge>
				)}
				{hasErrors && (
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
						title="Errores"
					>
						{
							<FontAwesomeIcon
								icon={faExclamation}
								style={{ color: "#ffffff" }}
							/>
						}
					</Badge>
				)}
				{!hasErrors && hasWarnings && (
					<Badge
						bg="warning"
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
						title="Avisos"
					>
						{
							<FontAwesomeIcon
								icon={faExclamationTriangle}
								style={{ color: "#ffffff" }}
							/>
						}
					</Badge>
				)}
				{data.lmsVisibility && getParentExpanded() && (
					<Badge
						bg="primary"
						className={
							styles.badge +
							" " +
							styles.badgeVisibility +
							" " +
							(reducedAnimations && styles.noAnimation) +
							" " +
							(showDetails && styles.showBadges) +
							" " +
							(highContrast && styles.highContrast)
						}
						title="Visibilidad"
					>
						{platform == "moodle" || platform == "sakai" ? (
							data.lmsVisibility == "show_unconditionally" ? (
								<FontAwesomeIcon icon={faEye} style={{ color: "#ffffff" }} />
							) : (
								<FontAwesomeIcon
									icon={faEyeSlash}
									style={{ color: "#ffffff" }}
								/>
							)
						) : data.lmsVisibility == "show_unconditionally" ? (
							<FontAwesomeIcon icon={faEye} style={{ color: "#ffffff" }} />
						) : (
							<FontAwesomeIcon icon={faEyeSlash} style={{ color: "#ffffff" }} />
						)}
					</Badge>
				)}
				{!isNaN(data.section) && getParentExpanded() && (
					<Badge
						bg="light"
						className={
							styles.badge +
							" " +
							styles.badgeSection +
							" " +
							(reducedAnimations && styles.noAnimation) +
							" " +
							(showDetails && styles.showBadges) +
							" " +
							(highContrast && styles.highContrast)
						}
						title="Sección"
					>
						{platform == "moodle"
							? Number(data.section)
							: Number(data.section) + 1}
					</Badge>
				)}
				{!isNaN(data.order) && getParentExpanded() && (
					<Badge
						bg="warning"
						className={
							styles.badge +
							" " +
							styles.badgePos +
							" " +
							(reducedAnimations && styles.noAnimation) +
							" " +
							(showDetails && styles.showBadges) +
							" " +
							(highContrast && styles.highContrast)
						}
						title="Posición en la sección"
					>
						{data.order + 1}
					</Badge>
				)}
			</div>
		</>
	);
}

export default ElementNode;
