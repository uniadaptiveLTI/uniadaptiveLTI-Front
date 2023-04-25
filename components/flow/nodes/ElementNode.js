import { useCallback, useContext } from "react";
import { Handle, Position } from "reactflow";
import { Badge } from "react-bootstrap";
import styles from "@components/styles/BlockContainer.module.css";

import {
	FileEarmarkCheck,
	PatchQuestionFill,
	Link45deg,
	PencilSquare,
	Question,
	ChatLeftText,
	FileEarmark,
	Folder,
	Tag,
	FileEarmarkText,
	Shuffle,
} from "react-bootstrap-icons";
import {
	BlockInfoContext,
	ExpandedContext,
	ItineraryInfoContext,
	SettingsContext,
	VersionInfoContext,
} from "@components/pages/_app";

function getTypeIcon(type) {
	switch (type) {
		//Moodle + Sakai
		case "questionnaire":
			return <FileEarmarkCheck size={32} />;
		case "assignment":
			return <PencilSquare size={32} />;
		case "forum":
			return <ChatLeftText size={32} />;
		case "file":
			return <FileEarmark size={32} />;
		case "folder":
			return <Folder size={32} />;
		case "url":
			return <Link45deg size={32} />;
		//Moodle
		case "workshop":
			return <Shuffle size={32} />;
		case "choice":
			return <Question size={32} />;
		case "tag":
			return <Tag size={32} />;
		case "page":
			return <FileEarmarkText size={32} />;
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
			return <PatchQuestionFill size={32} />;
	}
}

function ElementNode({ id, xPos, yPos, type, data, isConnectable }) {
	const onChange = useCallback((evt) => {
		console.log(evt.target.value);
	}, []);

	const { expanded, setExpanded } = useContext(ExpandedContext);
	const { blockSelected, setBlockSelected } = useContext(BlockInfoContext);
	const { itinerarySelected, setItinerarySelected } =
		useContext(ItineraryInfoContext);
	const { selectedEditVersion, setSelectedEditVersion } =
		useContext(VersionInfoContext);

	const { settings, setSettings } = useContext(SettingsContext);
	const parsedSettings = JSON.parse(settings);
	const { highContrast, showDetails, reducedAnimations } = parsedSettings;

	const handleClick = () => {
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

		if (expanded != true) {
			if (type != "start" && type != "end") setExpanded(true);
		}

		setItinerarySelected("");
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
			data.title +
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
			case "questionnaire":
				humanType = "Cuestionario";
				break;
			case "assignment":
				humanType = "Tarea";
				break;
			case "forum":
				humanType = "Foro";
				break;
			case "file":
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
			case "tag":
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
			onClick={handleClick}
			aria-label={getAriaLabel} //FIXME: Doesn't work
		>
			<span className={styles.blockInfo + " " + styles.top}>{data.label}</span>
			{process.env.DEV_MODE == true && (
				<>
					<div>{`id:${id}`}</div>
					<div>{`children:${data.children}`}</div>
				</>
			)}
			<Handle
				type="target"
				position={Position.Left}
				isConnectable={isConnectable}
				isConnectableStart="false"
			/>
			<div>{getTypeIcon(type)}</div>
			<Handle
				type="source"
				position={Position.Right}
				isConnectable={isConnectable}
				isConnectableEnd="false"
			/>
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
	);
}

export default ElementNode;
