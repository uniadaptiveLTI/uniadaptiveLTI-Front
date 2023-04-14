import styles from "@components/styles/BlockContainer.module.css";

import {
	useContext,
	useLayoutEffect,
	useCallback,
	useRef,
	useEffect,
} from "react";
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
	const { compact, showDetails, reducedAnimations } = parsedSettings;

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
				return "btn-warning ";
			case "url":
				return styles.btnURL + " ";
			//Moodle
			case "workshop":
				return styles.btnWorkshop + " ";
			case "inquery":
				return "btn-danger ";
			case "tag":
				return styles.btnTag + " ";
			case "page":
				return "btn-secondary ";
			case "badge":
				return "btn-success ";
			//Sakai
			case "exam":
				return "btn-danger ";
			case "contents":
				return styles.btnContents + " ";
			case "text":
				return "btn-secondary ";
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

	useEffect(() => {
		if (blockData) {
			if (blockData.id == -2) {
				blockDOM.current.scrollIntoView({
					behavior: "smooth",
					block: "center",
					inline: "start",
				});
			}
		}
	}, [blockData]);

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
					{process.env.DEV_MODE && (
						<>
							<div>{`id:${blockData.id}`}</div>
							<div>
								{blockData.children && `children:${blockData.children}`}
							</div>
							<div>{`x:${blockData.x},y:${blockData.y}`}</div>
						</>
					)}
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
									: "") +
								" " +
								(reducedAnimations && styles.noAnimation)
							}
						>
							{getTypeIcon()}
						</Button>

						{!inline && unit && (
							<Badge
								bg="light"
								className={
									styles.badge +
									" " +
									(reducedAnimations && styles.noAnimation) +
									" " +
									(showDetails && styles.showBadges)
								}
								title="Unidad"
							>
								{unit}
							</Badge>
						)}
						{!inline && order && (
							<Badge
								bg="warning"
								className={
									styles.badgeTwo +
									" " +
									(reducedAnimations && styles.noAnimation) +
									" " +
									(showDetails && styles.showBadges)
								}
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
