import { useCallback, useContext } from "react";
import { Handle, Position, NodeToolbar } from "reactflow";
import { Badge, Button } from "react-bootstrap";
import styles from "@components/styles/BlockContainer.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faCube,
	faClipboardQuestion,
	faPenToSquare,
	faComments,
	faFile,
	faFolderOpen,
	faLink,
	faHandshakeAngle,
	faQuestion,
	faTag,
	faFileLines,
	faEdit,
} from "@fortawesome/free-solid-svg-icons";
import {
	BlockInfoContext,
	ExpandedAsideContext,
	MapInfoContext,
	SettingsContext,
	VersionInfoContext,
	PlatformContext,
} from "@components/pages/_app";
import Image from "next/image";
import FocusTrap from "focus-trap-react";

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
	const parsedSettings = JSON.parse(settings);
	const { highContrast, showDetails, reducedAnimations } = parsedSettings;

	const handleEdit = () => {
		const blockData = {
			id: id,
			x: xPos,
			y: yPos,
			type: type,
			title: data.label,
			children: data.children,
			identation: data.identation,
			conditions: data.conditions,
			order: data.order,
			unit: data.unit,
		};

		if (expandedAside != true) {
			if (type != "start" && type != "end") setExpandedAside(true);
		}

		setSelectedEditVersion("");
		setBlockSelected(blockData);
	};

	function getTypeIcon(type) {
		switch (type) {
			//Moodle + Sakai
			case "quiz":
				return platform == "moodle" ? (
					<Image
						src="icons/moodle/quiz.svg"
						alt=""
						height={32}
						width={32}
						className={[styles.moodleIcon, "moodleIcon"].join(" ")}
					/>
				) : (
					<FontAwesomeIcon icon={faClipboardQuestion} />
				);
			case "assign":
				return platform == "moodle" ? (
					<Image
						src="icons/moodle/assign.svg"
						alt=""
						height={32}
						width={32}
						className={[styles.moodleIcon, "moodleIcon"].join(" ")}
					/>
				) : (
					<FontAwesomeIcon icon={faPenToSquare} />
				);
			case "forum":
				return platform == "moodle" ? (
					<Image
						src="icons/moodle/forum.svg"
						alt=""
						height={32}
						width={32}
						className={[styles.moodleIcon, "moodleIcon"].join(" ")}
					/>
				) : (
					<FontAwesomeIcon icon={faComments} />
				);
			case "resource":
				return platform == "moodle" ? (
					<Image
						src="icons/moodle/resource.svg"
						alt=""
						height={32}
						width={32}
						className={[styles.moodleIcon, "moodleIcon"].join(" ")}
					/>
				) : (
					<FontAwesomeIcon icon={faFile} />
				);
			case "folder":
				return platform == "moodle" ? (
					<Image
						src="icons/moodle/folder.svg"
						alt=""
						height={32}
						width={32}
						className={[styles.moodleIcon, "moodleIcon"].join(" ")}
					/>
				) : (
					<FontAwesomeIcon icon={faFolderOpen} />
				);
			case "url":
				return platform == "moodle" ? (
					<Image
						src="icons/moodle/url.svg"
						alt=""
						height={32}
						width={32}
						className={[styles.moodleIcon, "moodleIcon"].join(" ")}
					/>
				) : (
					<FontAwesomeIcon icon={faLink} />
				);
			//Moodle
			case "workshop":
				return platform == "moodle" ? (
					<Image
						src="icons/moodle/workshop.svg"
						alt=""
						height={32}
						width={32}
						className={[styles.moodleIcon, "moodleIcon"].join(" ")}
					/>
				) : (
					<FontAwesomeIcon icon={faHandshakeAngle} />
				);
			case "choice":
				return platform == "moodle" ? (
					<Image
						src="icons/moodle/choice.svg"
						alt=""
						height={32}
						width={32}
						className={[styles.moodleIcon, "moodleIcon"].join(" ")}
					/>
				) : (
					<FontAwesomeIcon icon={faQuestion} />
				);
			case "label":
				return platform == "moodle" ? (
					<Image
						src="icons/moodle/label.svg"
						alt=""
						height={32}
						width={32}
						className={[styles.moodleIcon, "moodleIcon"].join(" ")}
					/>
				) : (
					<FontAwesomeIcon icon={faTag} />
				);
			case "page":
				return platform == "moodle" ? (
					<Image
						src="icons/moodle/page.svg"
						alt=""
						height={32}
						width={32}
						className={[styles.moodleIcon, "moodleIcon"].join(" ")}
					/>
				) : (
					<FontAwesomeIcon icon={faFileLines} />
				);
			//Sakai
			case "exam":
				return null;
			case "contents":
				return null;
			case "text":
				return null;
			case "html":
				return null;
			//LTI
			default:
				return platform == "moodle" ? (
					<Image
						src="icons/moodle/lti.svg"
						alt=""
						height={32}
						width={32}
						className={[styles.moodleIcon, "moodleIcon"].join(" ")}
					/>
				) : (
					<FontAwesomeIcon icon={faCube} />
				);
		}
	}

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
						<Button variant="dark" onClick={handleEdit}>
							<FontAwesomeIcon icon={faEdit} />
							<span className="visually-hidden">Editar elemento</span>
						</Button>
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
				<div>{getTypeIcon(type)}</div>
				<span className={styles.blockInfo + " " + styles.bottom}>
					{getHumanDesc(type)}
				</span>
				{data.unit && (
					<Badge
						bg="light"
						className={
							styles.badge +
							" " +
							(reducedAnimations && styles.noAnimation) +
							" " +
							(showDetails && styles.showBadges) +
							" " +
							(highContrast && styles.highContrast)
						}
						title="Unidad"
					>
						{data.unit}
					</Badge>
				)}
				{data.order && (
					<Badge
						bg="warning"
						className={
							styles.badgeTwo +
							" " +
							(reducedAnimations && styles.noAnimation) +
							" " +
							(showDetails && styles.showBadges) +
							" " +
							(highContrast && styles.highContrast)
						}
						title="Posición en Moodle"
					>
						{data.order}
					</Badge>
				)}
			</div>
		</>
	);
}

export default ElementNode;
