import { useCallback, useContext } from "react";
import { Handle, Position } from "reactflow";
import { Badge } from "react-bootstrap";
import styles from "@components/styles/BlockContainer.module.css";

import { Diagram2 } from "react-bootstrap-icons";
import {
	BlockInfoContext,
	ExpandedContext,
	ItineraryInfoContext,
	SettingsContext,
	VersionInfoContext,
} from "@components/pages/_app";

function FragmentNode({ id, xPos, yPos, type, data, isConnectable }) {
	const onChange = useCallback((evt) => {
		//console.log(evt.target.value);
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
			innerBlocks: data.innerBlocks,
			identation: data.identation,
			conditions: data.conditions,
			order: data.order,
			unit: data.unit,
		};
		//console.log(blockData);

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
			"Fragmento, " +
			data.title +
			", posición en el eje X: " +
			xPos +
			", posición en el eje Y: " +
			yPos +
			end
		);
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
			<div>
				return <Diagram2 size={32} />;
			</div>
			<Handle
				type="source"
				position={Position.Right}
				isConnectable={isConnectable}
				isConnectableEnd="false"
			/>
			<span className={styles.blockInfo + " " + styles.bottom}>Fragmento</span>
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
					{data.innerBlocks
						? `${data.order}-${data.order + data.innerBlocks.length}`
						: data.order}
				</Badge>
			)}
		</div>
	);
}

export default FragmentNode;
