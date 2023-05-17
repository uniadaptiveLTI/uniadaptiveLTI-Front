import {
	forwardRef,
	useContext,
	useState,
	useEffect,
	useRef,
	useImperativeHandle,
} from "react";
import { Form, InputGroup } from "react-bootstrap";
import { useReactFlow } from "reactflow";
import { getNodeById, nearestPowerOfTwo } from "@components/components/Utils";
import { PlatformContext } from "@components/pages/_app";
import { getTypeIcon } from "@components/components/flow/nodes/NodeIcons";
import styles from "@components/styles/BlockSelector.module.css";

export default forwardRef(function BlockSelector(
	{ blockArray, defaultValue, placeholder, onChange, size = 16 },
	ref
) {
	const reactFlowInstance = useReactFlow();
	const defaultArray = blockArray ? blockArray : reactFlowInstance.getNodes();
	const { platform } = useContext(PlatformContext);
	const [selectedType, setSelectedType] = useState(defaultArray[0].type);
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
				onChange={(e) => {
					onChange = e;
					setSelectedType(
						getNodeById(localRef.current.value, reactFlowInstance)?.type
					);
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
