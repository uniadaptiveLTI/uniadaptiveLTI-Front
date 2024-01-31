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
import { getTypeIcon } from "/utils/NodeIcons";
import styles from "/styles/BlockSelector.module.css";
import { MetaDataContext } from "/pages/_app";

export default forwardRef(function BlockSelector(
	{ nodeArray, defaultValue, placeholder, autoFocus, onChange, size = 16 },
	ref
) {
	const { metaData } = useContext(MetaDataContext);
	const rfNodes = useNodes();
	const DEFAULT_ARRAY = nodeArray ? nodeArray : rfNodes;
	const [selectedType, setSelectedType] = useState(DEFAULT_ARRAY[0]?.type);
	const STYLE_SIZE = size ? styles["x" + size] : styles.x16;
	const localRef = useRef(null);
	useImperativeHandle(ref, () => ({
		getLocalRef: () => {
			localRef.current.value;
		},
	}));

	return (
		<InputGroup className="mb-3">
			<InputGroup.Text>
				<div className={STYLE_SIZE}>
					{getTypeIcon(
						selectedType,
						metaData.platform,
						nearestPowerOfTwo(size)
					)}
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
				{DEFAULT_ARRAY.map((node) => (
					<option key={node.id} value={node.id}>
						{node.data.label}
					</option>
				))}
			</Form.Select>
		</InputGroup>
	);
});
