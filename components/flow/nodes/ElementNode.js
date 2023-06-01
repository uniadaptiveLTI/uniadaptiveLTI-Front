import { useCallback, useContext } from "react";
import {
	Handle,
	Position,
	NodeToolbar,
	useReactFlow,
	useNodes,
} from "reactflow";
import { Badge, Button } from "react-bootstrap";
import styles from "@components/styles/BlockContainer.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faEdit,
	faRightFromBracket,
	faEye,
	faEyeSlash,
	faExclamation,
} from "@fortawesome/free-solid-svg-icons";
import {
	BlockInfoContext,
	ExpandedAsideContext,
	MapInfoContext,
	SettingsContext,
	VersionInfoContext,
	PlatformContext,
} from "@components/pages/_app";
import FocusTrap from "focus-trap-react";
import { getTypeIcon } from "./NodeIcons";
import { getNodeById, getUpdatedArrayById } from "@components/components/Utils";

function ElementNode({ id, xPos, yPos, type, data, isConnectable }) {
	const onChange = useCallback((evt) => {
		//console.log(evt.target.value);
	}, []);

	const { expandedAside, setExpandedAside } = useContext(ExpandedAsideContext);
	const { blockSelected, setBlockSelected } = useContext(BlockInfoContext);
	const { mapSelected, setMapSelected } = useContext(MapInfoContext);
	const { selectedEditVersion, setSelectedEditVersion } =
		useContext(VersionInfoContext);
	const { platform } = useContext(PlatformContext);

	const { settings, setSettings } = useContext(SettingsContext);
	const reactFlowInstance = useReactFlow();
	const parsedSettings = JSON.parse(settings);
	const { highContrast, showDetails, reducedAnimations } = parsedSettings;
	const rfNodes = useNodes();

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
		setSelectedEditVersion("");
		setBlockSelected(blockData);
	};

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
		let humanType = "";
		switch (type) {
			//Moodle + Sakai
			case "quiz":
				humanType = "Cuestionario";
				break;
			case "assign":
				humanType = "Tarea";
				break;
			case "forum":
				humanType = "Foro";
				break;
			case "resource":
				humanType = "Archivo";
				break;
			case "folder":
				humanType = "Carpeta";
				break;
			case "url":
				humanType = "URL";
				break;
			//Moodle
			case "workshop":
				humanType = "Taller";
				break;
			case "choice":
				humanType = "Consulta";
				break;
			case "label":
				humanType = "Etiqueta";
				break;
			case "page":
				humanType = "Página";
				break;
			case "generic":
				humanType = "Genérico";
				break;
			//Sakai
			case "exam":
				humanType = "Examen";
				break;
			case "contents":
				humanType = "Contenidos";
				break;
			case "text":
				humanType = "Texto";
				break;
			case "html":
				humanType = "HTML";
				break;
			//LTI
			default:
				humanType = "Elemento";
				break;
		}

		if (type == "start" || type == "end") return humanType + " del Mapa";
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

	return (
		<>
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
			>
				<span className={styles.blockInfo + " " + styles.top}>
					{data.label}
				</span>
				{process.env.DEV_MODE == true && (
					<div
						style={{
							position: "absolute",
							color: "black",
							left: "8em",
							top: "0",
							fontSize: "0.65em",
						}}
					>
						<div>{`id:${id}`}</div>
						<div>{`children:${data.children}`}</div>
						<div>{`conditions:${JSON.stringify(data.conditions)}`}</div>
					</div>
				)}
				<div>{getTypeIcon(type, platform)}</div>
				<span className={styles.blockInfo + " " + styles.bottom}>
					{getHumanDesc(type)}
				</span>
				{/*TODO: DO THIS CORRECTLY, ADD TO FRAGMENT, AND HIDE THIS WHEN HIDDEN, DO THIS IN BADGES TOO*/}
				{!data.lmsResource && (
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
						title="Unidad"
					>
						{
							<FontAwesomeIcon
								icon={faExclamation}
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
				{!isNaN(data.unit) && getParentExpanded() && (
					<Badge
						bg="light"
						className={
							styles.badge +
							" " +
							styles.badgeUnit +
							" " +
							(reducedAnimations && styles.noAnimation) +
							" " +
							(showDetails && styles.showBadges) +
							" " +
							(highContrast && styles.highContrast)
						}
						title="Sección"
					>
						{platform == "moodle" ? Number(data.unit) : Number(data.unit) + 1}
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
