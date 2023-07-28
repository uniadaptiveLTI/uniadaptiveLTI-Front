import { useCallback } from "react";
import { Handle, Position } from "reactflow";
import styles from "@root/styles/BlockContainer.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import { useContext } from "react";
import { SettingsContext } from "@root/pages/_app";

function FinalNode({ id, data, isConnectable }) {
	const onChange = useCallback((evt) => {
		console.log(evt.target.value);
	}, []);

	const { settings } = useContext(SettingsContext);
	const parsedSettings = JSON.parse(settings);
	const { reducedAnimations, highContrast } = parsedSettings;

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
			>
				<div>
					<FontAwesomeIcon
						icon={faCaretDown}
						style={{ transform: "rotate(90deg)" }}
					/>
				</div>
				<span className={styles.blockInfo + " " + styles.bottom}>Salida</span>
			</div>
		</>
	);
}

export default FinalNode;
