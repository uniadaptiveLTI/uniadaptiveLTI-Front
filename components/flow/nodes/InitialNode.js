import { useCallback } from "react";
import { Handle, Position } from "reactflow";
import styles from "@components/styles/BlockContainer.module.css";
import { CaretDownFill } from "react-bootstrap-icons";

const handleStyle = { left: 10 };

function InitialNode({ data, isConnectable }) {
	const onChange = useCallback((evt) => {
		console.log(evt.target.value);
	}, []);

	return (
		<div className={styles.textUpdaterNode}>
			<Handle
				type="source"
				position={Position.Right}
				isConnectable={isConnectable}
				isConnectableEnd="false"
			/>
			<div>
				<CaretDownFill style={{ transform: "rotate(-90deg)" }} size={32} />
			</div>
		</div>
	);
}

export default InitialNode;
