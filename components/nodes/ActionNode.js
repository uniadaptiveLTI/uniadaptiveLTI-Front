import { useCallback } from "react";
import { Handle, Position } from "reactflow";
import styles from "@components/styles/BlockContainer.module.css";

const handleStyle = { left: 10 };

function ActionNode({ data, isConnectable }) {
	const onChange = useCallback((evt) => {
		console.log(evt.target.value);
	}, []);

	return (
		<div className={styles.textUpdaterNode}>
			<Handle
				type="target"
				position={Position.Left}
				isConnectable={isConnectable}
			/>
			<div>
				<label htmlFor="text">Text:</label>
				<input id="text" name="text" onChange={onChange} className="nodrag" />
			</div>
		</div>
	);
}

export default ActionNode;
