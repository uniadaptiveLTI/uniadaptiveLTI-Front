import {
	forwardRef,
	useContext,
	useState,
	useEffect,
	useRef,
	useImperativeHandle,
} from "react";
import { Form, InputGroup } from "react-bootstrap";
import { useReactFlow, useNodes } from "reactflow";
import { nearestPowerOfTwo } from "@utils/Utils";
import { getNodeById } from "@utils/Nodes";
import { PlatformContext } from "/pages/_app";
import { getTypeIcon } from "/utils/NodeIcons";
import styles from "/styles/BlockSelector.module.css";

export default forwardRef(function BlockSelector(
	{ nodeArray, defaultValue, placeholder, autoFocus, onChange, size = 16 },
	ref
) {
	const reactFlowInstance = useReactFlow();
	const rfNodes = useNodes();
	const defaultArray = nodeArray ? nodeArray : rfNodes;
	const { platform } = useContext(PlatformContext);
	const [selectedType, setSelectedType] = useState(defaultArray[0]?.type);
	const styleSize = size ? styles["x" + size] : styles.x16;
	const localRef = useRef(null);
	useImperativeHandle(ref, () => ({
		getLocalRef: () => {
			localRef.current.value;
		},
	}));

	return (
		<InputGroup className="mb-3">
			<InputGroup.Text>
				<div className={styleSize}>
					{getTypeIcon(selectedType, platform, nearestPowerOfTwo(size))}
				</div>
			</InputGroup.Text>
			<Form.Select
				ref={localRef}
				defaultValue={defaultValue}
				placeholder=""
				autoFocus={autoFocus}
				onChange={(e) => {
					onChange(e);
					setSelectedType(getNodeById(localRef.current.value, rfNodes)?.type);
				}}
			>
				{defaultArray.map((node) => (
					<option key={node.id} value={node.id}>
						{node.data.label}
					</option>
				))}
			</Form.Select>
		</InputGroup>
	);
});
