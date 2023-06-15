import { HexColorPicker, HexColorInput } from "react-colorful";
import { useEffect, useId, useState } from "react";
import { Form, InputGroup, Button } from "react-bootstrap";
import { getContrastingColor, getRootStyle } from "@utils/Utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPalette } from "@fortawesome/free-solid-svg-icons";

export default function InlineColorSelector({
	id,
	color,
	setColor,
	label = "",
}) {
	const [showSelector, setShowSelector] = useState(false);
	const [iconColor, setIconColor] = useState("#000");

	const labelID = useId();

	useEffect(() => {
		setIconColor(getContrastingColor(color));
	}, [color]);

	console.log(faPalette);

	return (
		<div
			style={{
				position: "relative",
			}}
		>
			{label && <Form.Label htmlFor={labelID}>{label}</Form.Label>}
			<InputGroup>
				<Form.Control
					id={id && label.length == 0 ? id : labelID}
					value={color}
					onChange={(e) => setColor(e.target.value)}
					styles={{
						padding: "1em",
						borderRadius: getRootStyle("--main-ui-button-border-radius"),
						border: getRootStyle("--main-ui-borders"),
					}}
				/>
				<Button
					onClick={() => setShowSelector(true)}
					style={{
						background: color ? color : "#000",
						border: getRootStyle("--main-ui-borders"),
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
