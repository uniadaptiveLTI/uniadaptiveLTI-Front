import { useEffect, useId, useState, useRef } from "react";
import { Form, InputGroup, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faBorderNone,
	faBorderAll,
	faBorderTopLeft,
} from "@fortawesome/free-solid-svg-icons";
import {
	getRootStyle,
	getContrastingColor,
	getContrastingTextColor,
} from "@utils/Colors";
import InlineColorSelector from "./InlineColorSelector";

export default function InlineButtonSelector({
	background,
	setBackground,
	border,
	setBorder,
	label,
	btnLabel = "Ejemplo",
}) {
	const line = border.line;
	const InitialLineWidth = line.split(" ")[0];
	const InitialLineColor = line.split(" ")[2];
	const radius = border.radius;

	const [selectedOption, setSelectedOption] = useState(
		border.line == "none" || border.line == undefined || border.line == ""
			? 0
			: border.radius == "none" ||
			  border.radius == undefined ||
			  border.radius == ""
			? 1
			: 2
	);

	const primaryBGColor = getRootStyle("--primary-background-color");
	const primaryBorderColor = primaryBGColor;
	const primaryIconColor = getContrastingColor(primaryBGColor);
	const lightBGColor = getRootStyle("--light-background-color");
	const secondaryBorderColor = lightBGColor;
	const secondaryIconColor = getContrastingColor(lightBGColor);

	const [lineColor, setLineColor] = useState(InitialLineColor);
	const [lineWidth, setLineWidth] = useState(InitialLineWidth);
	const [borderRadius, setBorderRadius] = useState(radius);

	const labelID = useId();

	const lineColorDOM = useRef();
	const borderRadiusDOM = useRef();

	useEffect(() => {
		let finalBorder = {};
		if (selectedOption === 0) {
			finalBorder.line = `1px solid ${background}`;
		} else {
			finalBorder.line = `${lineWidth} solid ${lineColor}`;
		}
		if (selectedOption === 2) {
			finalBorder.radius = `${borderRadius}`;
		} else {
			finalBorder.radius = `0px`;
		}
		setBorder(finalBorder);
	}, [selectedOption, lineColor, lineWidth, borderRadius]);

	return (
		<>
			{label && <Form.Label htmlFor={labelID}>{label}</Form.Label>}
			<div
				className={"mb-1"}
				style={{
					display: "flex",
					flexDirection: "row",
					alignItems: "baseline",
					justifyContent: "flex-start",
					width: "auto",
				}}
			>
				<InlineColorSelector
					id={labelID}
					color={background}
					setColor={setBackground}
				/>
				<InputGroup className={"mx-4"} style={{ width: "auto" }}>
					<Button
						onClick={() => setSelectedOption(0)}
						style={{
							background: selectedOption == 0 ? primaryBGColor : lightBGColor,
							color:
								selectedOption == 0 ? primaryIconColor : secondaryIconColor,
							borderColor:
								selectedOption == 0 ? primaryBorderColor : secondaryBorderColor,
						}}
					>
						<FontAwesomeIcon icon={faBorderNone} />
					</Button>
					<Button
						onClick={() => setSelectedOption(1)}
						style={{
							background: selectedOption == 1 ? primaryBGColor : lightBGColor,
							color:
								selectedOption == 1 ? primaryIconColor : secondaryIconColor,
							borderColor:
								selectedOption == 1 ? primaryBorderColor : secondaryBorderColor,
						}}
					>
						<FontAwesomeIcon icon={faBorderAll} />
					</Button>
					<Button
						onClick={() => setSelectedOption(2)}
						style={{
							background: selectedOption == 2 ? primaryBGColor : lightBGColor,
							color:
								selectedOption == 2 ? primaryIconColor : secondaryIconColor,
							borderColor:
								selectedOption == 2 ? primaryBorderColor : secondaryBorderColor,
						}}
					>
						<FontAwesomeIcon icon={faBorderTopLeft} />
					</Button>
				</InputGroup>
				{selectedOption == 0 && <p className={"mb-0"}>Sin bordes.</p>}
				{selectedOption == 1 && <p className={"mb-0"}>Con bordes.</p>}
				{selectedOption == 2 && (
					<p className={"mb-0"}>Con bordes redondeados.</p>
				)}
			</div>
			<div
				style={{
					display: "flex",
					flexDirection: "row",
					alignItems: "baseline",
					justifyContent: "flex-start",
					width: "auto",
				}}
			>
				{selectedOption == 1 && (
					<div
						className={"me-4"}
						style={{ display: "flex", flexDirection: "row" }}
					>
						<Form.Control
							ref={lineColorDOM}
							defaultValue={lineWidth}
							onChange={(e) => setLineWidth(e.target.value)}
							style={{ width: "auto" }}
						/>
						<InlineColorSelector
							ref={lineColorDOM}
							color={lineColor}
							setColor={setLineColor}
						/>
					</div>
				)}
				{selectedOption == 2 && (
					<>
						<Form.Control
							ref={lineColorDOM}
							defaultValue={lineWidth}
							onChange={(e) => setLineWidth(e.target.value)}
							style={{ width: "auto" }}
						/>
						<InlineColorSelector
							ref={lineColorDOM}
							color={lineColor}
							setColor={setLineColor}
						/>
						<Form.Control
							className={"me-4"}
							ref={borderRadiusDOM}
							defaultValue={radius}
							style={{ width: "auto" }}
							onChange={(e) => setBorderRadius(e.target.value)}
						></Form.Control>
					</>
				)}
				<Button
					aria-label="Botón de ejemplo que demuestra la personalización elegida"
					style={{
						color: getContrastingTextColor(background),
						background: background,
						border: `${selectedOption >= 1 ? lineWidth : "1px"} solid ${
							selectedOption >= 1 ? lineColor : background
						}`,
						borderRadius: `${selectedOption === 2 ? borderRadius : "0px"}`,
					}}
				>
					{btnLabel}
				</Button>
			</div>
		</>
	);
}
