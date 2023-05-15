import { useCallback, useContext } from "react";
import { Handle, Position, NodeToolbar } from "reactflow";
import styles from "@components/styles/BlockContainer.module.css";
import {
	BlockInfoContext,
	ExpandedAsideContext,
	MapInfoContext,
	SettingsContext,
	VersionInfoContext,
	PlatformContext,
} from "@components/pages/_app";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faAward,
	faCube,
	faEdit,
	faEnvelope,
	faUserPlus,
	faUserMinus,
} from "@fortawesome/free-solid-svg-icons";
import FocusTrap from "focus-trap-react";
import { Button } from "react-bootstrap";

export const ActionBlocks = ["badge", "mail", "addgroup", "remgroup"];

const getHumanDesc = (type) => {
	let humanType = "";
	switch (type) {
		//Moodle + Sakai
		case "mail":
			humanType = "Enviar correo";
			break;
		case "addgroup":
			humanType = "Añadir a grupo";
			break;
		case "remgroup":
			humanType = "Eliminar grupo";
			break;
		//Moodle
		case "badge":
			humanType = "Dar Medalla";
			break;
		//Sakai
		//LTI
		default:
			humanType = "Elemento de Acción";
			break;
	}
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
		blockData.label +
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

	const { expandedAside, setExpandedAside } = useContext(ExpandedAsideContext);
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
			case "mail":
				return platform == "moodle" ? (
					<FontAwesomeIcon icon={faEnvelope} className={"moodleIcon"} />
				) : (
					<FontAwesomeIcon icon={faEnvelope} />
				);
			case "addgroup":
				return platform == "moodle" ? (
					<FontAwesomeIcon icon={faUserPlus} className={"moodleIcon"} />
				) : (
					<FontAwesomeIcon icon={faUserPlus} />
				);
			case "remgroup":
				return platform == "moodle" ? (
					<FontAwesomeIcon icon={faUserMinus} className={"moodleIcon"} />
				) : (
					<FontAwesomeIcon icon={faUserMinus} />
				);

			//Sakai

			//LTI
			default:
				return <FontAwesomeIcon icon={faCube} />;
		}
	}

	const handleEdit = () => {
		console.log(data);
		const blockData = {
			id: id,
			position: { x: xPos, y: yPos },
			type: type,
			data: {
				label: data.label,
				lmsResource: data.lmsResource,
			},
		};
		if (expandedAside != true) {
			if (type != "start" && type != "end") setExpandedAside(true);
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
							<span className="visually-hidden">Editar acción</span>
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
