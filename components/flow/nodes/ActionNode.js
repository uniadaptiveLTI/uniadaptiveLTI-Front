import { useCallback, useContext } from "react";
import { Handle, Position } from "reactflow";
import styles from "@components/styles/BlockContainer.module.css";
import {
	BlockInfoContext,
	ExpandedContext,
	MapInfoContext,
	SettingsContext,
	VersionInfoContext,
	PlatformContext,
} from "@components/pages/_app";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAward, faCube } from "@fortawesome/free-solid-svg-icons";

export const ActionBlocks = ["badge"];

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
			humanType = "Folder";
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
	/*
	let end = blockData.unit
		? ", forma parte de la unidad " +
		  blockData.unit +
		  ", calculado desde su identación."
		: ".";*/
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

function ActionNode({
	id,
	xPos,
	yPos,
	type,
	data,
	children,
	isConnectable,
	order = 1,
	unit = 1,
}) {
	const onChange = useCallback((evt) => {
		//console.log(evt.target.value);
	}, []);

	const { expanded, setExpanded } = useContext(ExpandedContext);
	const { blockSelected, setBlockSelected } = useContext(BlockInfoContext);
	const { mapSelected, setMapSelected } = useContext(MapInfoContext);
	const { selectedEditVersion, setSelectedEditVersion } =
		useContext(VersionInfoContext);

	const { settings } = useContext(SettingsContext);
	const parsedSettings = JSON.parse(settings);
	const { highContrast, reducedAnimations } = parsedSettings;
	const { platform } = useContext(PlatformContext);

	function getTypeIcon(type) {
		switch (type) {
			//Moodle + Sakai

			//Moodle
			case "badge":
				return platform == "moodle" ? (
					<FontAwesomeIcon icon={faAward} className={"moodleIcon"} />
				) : (
					<FontAwesomeIcon icon={faAward} />
				);

			//Sakai

			//LTI
			default:
				return <FontAwesomeIcon icon={faCube} />;
		}
	}

	const handleClick = () => {
		const blockData = {
			id: id,
			x: xPos,
			y: yPos,
			type: type,
			title: data.label,
			children: children,
			identation: data.identation,
			conditions: data.conditions,
		};
		if (expanded != true) {
			if (type != "start" && type != "end") setExpanded(true);
		}

		setSelectedEditVersion("");
		setBlockSelected(blockData);
	};

	return (
		<>
			<Handle
				type="target"
				position={Position.Left}
				isConnectable={isConnectable}
				isConnectableStart="false"
			/>
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
			>
				<span className={styles.blockInfo + " " + styles.top}>
					{data.label}
				</span>

				<div>{getTypeIcon(type)}</div>
				<span className={styles.blockInfo + " " + styles.bottom}>
					{getHumanDesc(type)}
				</span>
			</div>
		</>
	);
}

export default ActionNode;
