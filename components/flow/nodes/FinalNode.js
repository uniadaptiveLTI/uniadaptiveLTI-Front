import { useCallback } from "react";
import { Handle, Position } from "reactflow";
import styles from "@components/styles/BlockContainer.module.css";
import { CaretDownFill } from "react-bootstrap-icons";
import { useContext } from "react";
import { SettingsContext } from "@components/pages/_app";

function FinalNode({ id, data, isConnectable }) {
	const onChange = useCallback((evt) => {
		console.log(evt.target.value);
	}, []);

	const { settings } = useContext(SettingsContext);
	const parsedSettings = JSON.parse(settings);
	const { reducedAnimations, highContrast } = parsedSettings;

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
		>
			<Handle
				type="target"
				position={Position.Left}
				isConnectable={isConnectable}
				isConnectableStart="false"
			/>
			<div>
				<CaretDownFill style={{ transform: "rotate(90deg)" }} size={32} />
			</div>
			<span className={styles.blockInfo + " " + styles.bottom}>Fin</span>
		</div>
	);
}

export default FinalNode;
