import { useCallback, useContext } from "react";
import { Handle, Position } from "reactflow";
import { Badge } from "react-bootstrap";
import styles from "@components/styles/BlockContainer.module.css";

import {
	FileEarmarkCheck,
	PatchQuestionFill,
	CaretDownFill,
	Link45deg,
	PencilSquare,
	Question,
	ChatLeftText,
	FileEarmark,
	Folder,
	Tag,
	FileEarmarkText,
	StarFill,
	Diagram2,
	Shuffle,
} from "react-bootstrap-icons";
import { SettingsContext } from "@components/pages/_app";

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
		case "inquery":
			return <Question size={32} />;
		case "tag":
			return <Tag size={32} />;
		case "page":
			return <FileEarmarkText size={32} />;
		case "badge":
			return <StarFill size={32} />;
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
		case "start":
			return (
				<CaretDownFill style={{ transform: "rotate(-90deg)" }} size={32} />
			);
		case "end":
			return <CaretDownFill style={{ transform: "rotate(90deg)" }} size={32} />;
		case "fragment":
			return <Diagram2 size={32} />;
		default:
			return <PatchQuestionFill size={32} />;
	}
}

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
		case "inquery":
			humanType = "Consulta";
			break;
		case "tag":
			humanType = "Etiqueta";
			break;
		case "page":
			humanType = "Página";
			break;
		case "badge":
			humanType = "Medalla";
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
		case "start":
			humanType = "Inicio";
			break;
		case "end":
			humanType = "Final";
			break;
		case "fragment":
			humanType = "Fragmento";
			break;
		default:
			humanType = "Elemento";
			break;
	}

	if (type == "start" || type == "end") return humanType + " del Mapa";
	return humanType;
};

const getAriaLabel = () => {
	let end = blockData.unit
		? ", forma parte de la unidad " +
		  blockData.unit +
		  ", calculado desde su identación."
		: ".";
	return (
		getHumanDesc() +
		", " +
		blockData.title +
		", posición en el eje X: " +
		blockData.x +
		", posición en el eje Y: " +
		blockData.y +
		end
	);
};

function ElementNode({ id, data, isConnectable, type, order = 1, unit = 1 }) {
	const onChange = useCallback((evt) => {
		console.log(evt.target.value);
	}, []);

	const { settings, setSettings } = useContext(SettingsContext);
	const parsedSettings = JSON.parse(settings);
	const { highContrast, showDetails, reducedAnimations } = parsedSettings;

	return (
		<div
			id={id}
			className={
				styles.container +
				" " +
				(highContrast && styles.highContrast + " highContrast ") +
				" " +
				(reducedAnimations && styles.noAnimation + " noAnimation")
			}
		>
			<span className={styles.blockInfo + " " + styles.top}>{data.label}</span>
			{process.env.DEV_MODE == true && (
				<>
					<div>{`id:${id}`}</div>
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
			{unit && (
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
					{unit}
				</Badge>
			)}
			{order && (
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
					{order}
				</Badge>
			)}
		</div>
	);
}

export default ElementNode;
