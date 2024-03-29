import { useCallback, useContext, useEffect } from "react";
import {
	Handle,
	Position,
	NodeToolbar,
	useReactFlow,
	useNodes,
} from "reactflow";
import { Badge, Button } from "react-bootstrap";
import styles from "/styles/BlockContainer.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faEdit,
	faExclamation,
	faExclamationTriangle,
	faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import {
	EditedNodeContext,
	ExpandedAsideContext,
	MapInfoContext,
	SettingsContext,
	EditedVersionContext,
	ErrorListContext,
	MetaDataContext,
} from "pages/_app";
import FocusTrap from "focus-trap-react";
import { getTypeIcon } from "@utils/NodeIcons";
import { getUpdatedArrayById, parseBool } from "@utils/Utils";
import {
	getNodeById,
	getNumberOfIndependentConditions,
	getPrimaryConditionType,
} from "@utils/Nodes";
import { useState } from "react";
import { NodeDeclarations } from "@utils/TypeDefinitions";
import { getConditionIcon } from "@utils/ConditionIcons";
import SimpleConditionsMoodle from "@components/flow/conditions/SimpleConditionsMoodle";
import SimpleConditionsSakai from "@components/flow/conditions/SimpleConditionsSakai";
import MoodleBadges from "@components/flow/nodes/moodle/MoodleBadges";
import SakaiBadges from "@components/flow/nodes/sakai/SakaiBadges";
import { Platforms } from "@utils/Platform";
import { INode } from "@components/interfaces/INode";

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
	const { metaData } = useContext(MetaDataContext);
	const { expandedAside, setExpandedAside } = useContext(ExpandedAsideContext);
	const { nodeSelected, setNodeSelected } = useContext(EditedNodeContext);
	const { mapSelected, setMapSelected } = useContext(MapInfoContext);
	const { editVersionSelected, setEditVersionSelected } =
		useContext(EditedVersionContext);
	const { errorList } = useContext(ErrorListContext);
	const { settings, setSettings } = useContext(SettingsContext);
	const reactFlowInstance = useReactFlow();
	const PARSED_SETTINGS = JSON.parse(settings);
	const { highContrast, showDetails, reducedAnimations } = PARSED_SETTINGS;
	const [hasErrors, setHasErrors] = useState(false);
	const [hasWarnings, setHasWarnings] = useState(false);
	const [isHovered, setIsHovered] = useState(false);
	const rfNodes = useNodes();
	const [hasExtraConditions, setHasExtraConditions] = useState(
		getNumberOfIndependentConditions(getNodeById(id, rfNodes)) > 0
	);

	const getParentExpanded = () => {
		const NODES = rfNodes;
		const PARENT_ID = getNodeById(id, NODES).parentNode;

		if (PARENT_ID) {
			//If is part of a fragment
			const parent = getNodeById(PARENT_ID, NODES);

			return parent.data.expanded;
		} else {
			//Treat as expanded
			return true;
		}
	};

	const handleEdit = () => {
		const CURRENT_NODES = reactFlowInstance.getNodes();
		const BLOCKDATA = getNodeById(id, CURRENT_NODES);
		if (expandedAside != true) {
			setExpandedAside(true);
		}

		setEditVersionSelected(undefined);
		setNodeSelected(BLOCKDATA);
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

	const hasEnd = (type) => {
		const node = NodeDeclarations.find((node) => node.type == type);
		if (node.endHandle.includes(metaData.platform)) {
			return true;
		} else {
			return false;
		}
	};

	const getHumanDesc = () => {
		const node = NodeDeclarations.find((node) => node.type == type);
		let humanType = "";
		if (node) {
			humanType = node.name;
		} else {
			humanType = "Elemento";
		}
		return humanType;
	};

	const extractSelf = () => {
		const FRAGMENT = getNodeById(
			getNodeById(id, reactFlowInstance.getNodes()).parentNode,
			reactFlowInstance.getNodes()
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
			]) as Array<INode>
		);
	};

	const getSelfErrors = () => {
		const RELATED_ERRORS = errorList.filter((error) => error.nodeId == id);
		const ERRORS = RELATED_ERRORS.filter(
			(rerrors) => rerrors.severity == "error"
		);
		const WARNINGS = RELATED_ERRORS.filter(
			(rerrors) => rerrors.severity == "warning"
		);
		setHasErrors(ERRORS.length > 0);
		setHasWarnings(WARNINGS.length > 0);
	};

	useEffect(() => {
		getSelfErrors();
	}, [data]);

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
			{isHovered &&
				selected &&
				!dragging &&
				metaData.platform == Platforms.Moodle && (
					<div className={styles.hovedConditions}>
						<SimpleConditionsMoodle id={id} />
					</div>
				)}
			{isHovered &&
				selected &&
				!dragging &&
				metaData.platform == Platforms.Sakai && (
					<div className={styles.hovedConditions}>
						<SimpleConditionsSakai id={id} />
					</div>
				)}
			<Handle
				type="target"
				position={Position.Left}
				isConnectable={isConnectable}
				isConnectableStart={false}
				onClick={() => console.log("TEST")}
			/>
			{hasEnd(type) && (
				<Handle
					type="source"
					position={Position.Right}
					isConnectable={isConnectable}
					isConnectableEnd={false}
					onClick={() => console.log("TEST")}
				/>
			)}

			<NodeToolbar position={Position.Left} offset={25}>
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
				aria-label={getAriaLabel()} //FIXME: Doesn't work
				onKeyDown={(e) => {
					if (e.key == "Enter") handleEdit();
				}}
				tabIndex={0}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
			>
				<span className={styles.blockInfo + " " + styles.top}>
					{data.label}
				</span>
				<div>{getTypeIcon(type, metaData.platform)}</div>
				<span className={styles.blockInfo + " " + styles.bottom}>
					{getHumanDesc()}
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

				{metaData.platform == Platforms.Moodle && (
					<MoodleBadges
						data={data}
						showDetails={showDetails}
						highContrast={highContrast}
						reducedAnimations={reducedAnimations}
						getParentExpanded={getParentExpanded}
						styles={styles}
					/>
				)}

				{metaData.platform == Platforms.Sakai && (
					<SakaiBadges
						data={data}
						type={type}
						showDetails={showDetails}
						highContrast={highContrast}
						reducedAnimations={reducedAnimations}
						getParentExpanded={getParentExpanded}
						styles={styles}
					/>
				)}
			</div>
		</>
	);
}

export default ElementNode;
