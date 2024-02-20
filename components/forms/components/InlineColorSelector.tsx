import { HexColorPicker, HexColorInput } from "react-colorful";
import { ReactNode, useEffect, useId, useState } from "react";
import { Form, InputGroup, Button } from "react-bootstrap";
import { getContrastingColor, getRootStyle } from "@utils/Colors";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPalette } from "@fortawesome/free-solid-svg-icons";

interface Props {
	color: string;
	setColor: (e) => void;
	label: string | ReactNode;
}

export default function InlineColorSelector({
	color,
	setColor,
	label = "",
}: Props) {
	const [showSelector, setShowSelector] = useState(false);
	const [iconColor, setIconColor] = useState("#000");

	const LABEL_ID = useId();

	useEffect(() => {
		setIconColor(getContrastingColor(color));
	}, [color]);

	return (
		<div
			style={{
				position: "relative",
			}}
		>
			{label && <Form.Label htmlFor={LABEL_ID}>{label}</Form.Label>}
			<InputGroup>
				<Form.Control
					id={LABEL_ID}
					value={color}
					onChange={(e) => setColor(e.target.value)}
				/>
				<Button
					onClick={() => setShowSelector(true)}
					style={{
						background: color ? color : "#000",
						border: getRootStyle("--main-borders"),
					}}
				>
					<FontAwesomeIcon icon={faPalette} style={{ color: iconColor }} />
				</Button>
			</InputGroup>
			{showSelector && (
				<div
					style={{
						display: "flex",
						flexDirection: "row",
						position: "absolute",
						right: 0,
						bottom: "-100%",
						zIndex: 1000,
					}}
				>
					<HexColorPicker color={color} onChange={setColor} />
					<div style={{ position: "relative" }}>
						<Button variant="danger" onClick={() => setShowSelector(false)}>
							X
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
