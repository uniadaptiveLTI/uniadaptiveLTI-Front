import styles from "@components/styles/BlockContainer.module.css";

import { useContext, useLayoutEffect, useCallback, useRef } from "react";
import {
	BlockInfoContext,
	BlockPositionContext,
	ExpandedContext,
	DimensionsContext,
	ItineraryInfoContext,
	VersionInfoContext,
	SettingsContext,
} from "../pages/_app.js";
import { Button, Badge } from "react-bootstrap";
import {
	FileEarmarkCheck,
	PatchQuestionFill,
	CaretDownFill,
	Link45deg,
	PencilSquare,
	Wechat,
	Question,
	ChatLeftText,
	FileEarmark,
	Folder,
	Tag,
	FileEarmarkText,
	StarFill,
	PlusSquareFill,
} from "react-bootstrap-icons";

export default function BlockContainer({ blockData, inline, unit, order }) {
	const id = blockData ? blockData.id : "no-id";
	const blockDOM = useRef(null);

	const { blockSelected, setBlockSelected } = useContext(BlockInfoContext);
	const { itinerarySelected, setItinerarySelected } =
		useContext(ItineraryInfoContext);
	const { selectedEditVersion, setSelectedEditVersion } =
		useContext(VersionInfoContext);
	const { settings, setSettings } = useContext(SettingsContext);
	const parsedSettings = JSON.parse(settings);
	const { compact, animations } = parsedSettings;

	const { expanded, setExpanded } = useContext(ExpandedContext);
	const { blockPositions, setBlockPositions } =
		useContext(BlockPositionContext);
	const { dimensions, setDimensions } = useContext(DimensionsContext);

	const handleClick = () => {
		if (expanded != true) {
			if (blockData.type != "start" && blockData.type != "end")
				setExpanded(true);
		}
		setItinerarySelected("");
		setSelectedEditVersion("");
		setBlockSelected(blockData);
	};

	const getHumanDesc = () => {
		if (blockData) {
			let humanType = "";
			switch (blockData.type) {
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
					humanType = "Folder";
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
				case "generic":
					humanType = "Genérico";
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

			if (blockData.type == "start" || blockData.type == "end")
				return humanType + " del Mapa";
			return humanType;
		}
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

	function getTypeIcon() {
		switch (blockData.type) {
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
				return <Wechat size={32} />; //FIXME: This need to be changed by other icon
			case "choice":
				return <Question size={32} />;
			case "generic":
				return <PatchQuestionFill size={32} />;
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
				return (
					<CaretDownFill style={{ transform: "rotate(90deg)" }} size={32} />
				);
			case "fragment":
				return <PlusSquareFill size={32} />;
			default:
				return <PatchQuestionFill size={32} />;
		}
	}

	function getTypeColor() {
		//TODO: Add the rest
		switch (blockData.type) {
			//Moodle + Sakai
			case "questionnaire":
				return styles.btnQuestionnaire + " ";
			case "assignment":
				return "btn-info ";
			case "forum":
				return styles.btnForum + " ";
			case "file":
				return "btn-primary ";
			case "folder":
				return " ";
			case "url":
				return styles.btnURL + " ";
			//Moodle
			case "workshop":
				return " ";
			case "choice":
				return " ";
			case "generic":
				return " ";
			case "tag":
				return " ";
			case "page":
				return " ";
			case "badge":
				return "btn-success ";
			//Sakai
			case "exam":
				return "btn-danger ";
			case "contents":
				return null;
			case "text":
				return null;
			case "html":
				return styles.btnHTML + " ";
			//LTI
			case "start":
				return "btn-danger ";
			case "end":
				return "btn-danger ";
			case "fragment":
				return styles.btnFragment + " ";
			default:
				return "btn-warning ";
		}
	}

	const sendDimensions = useCallback(() => {
		const block = blockDOM.current;
		if (block && blockData) {
			let bpos;
			bpos = block.getBoundingClientRect();
			bpos.id = blockData.id;
			bpos.children = blockData.children;
			blockPositions.push({
				bpos,
			});
		}
	}, [blockData, blockPositions, blockDOM]);

	useLayoutEffect(() => {
		sendDimensions();
	}, [dimensions, sendDimensions]);

	useLayoutEffect(() => {
		//Añadido de las coordenadas de cada bloque
		sendDimensions();
	}, []);

	return (
		<>
			{blockData ? (
				<div
					className={
						inline
							? ""
							: styles.container + (compact ? " " + styles.compact : "")
					}
				>
					<span className={styles.blockInfo}>{blockData.title}</span>
					<div>
						<Button
							ref={blockDOM}
							onClick={handleClick}
							id={id}
							aria-label={getAriaLabel()}
							className={
								getTypeColor() +
								styles.block +
								" " +
								(blockData.type == "start" || blockData.type == "end"
									? styles.importantOutline
									: blockSelected.id == blockData.id
									? styles.borderAnim
									: "")
							}
						>
							{getTypeIcon()}
						</Button>

						{!inline && unit && (
							<Badge bg="light" className={styles.badge} title="Unidad">
								{unit}
							</Badge>
						)}
						{!inline && order && (
							<Badge
								bg="warning"
								className={styles.badgeTwo}
								title="Posición en Moodle"
							>
								{order}
							</Badge>
						)}
					</div>
					{!inline && (
						<span className={styles.blockInfo}>{getHumanDesc()}</span>
					)}
				</div>
			) : (
				<></>
			)}
		</>
	);
}
