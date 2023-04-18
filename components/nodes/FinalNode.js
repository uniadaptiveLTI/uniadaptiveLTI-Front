import { useCallback } from "react";
import { Handle, Position } from "reactflow";
import styles from "@components/styles/BlockContainer.module.css";
import { CaretDownFill } from "react-bootstrap-icons";

const handleStyle = { left: 10 };

function FinalNode({ data, isConnectable }) {
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
				<CaretDownFill style={{ transform: "rotate(90deg)" }} size={32} />
			</div>
		</div>
	);
}

export default FinalNode;
