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
	const LINE = border.line;
	const INITIAL_LINE_WIDTH = LINE.split(" ")[0];
	const INITIAL_LINE_COLOR = LINE.split(" ")[2];
	const RADIUS = border.radius;

	const [selectedOption, setSelectedOption] = useState(
		border.line == "none" || border.line == undefined || border.line == ""
			? 0
			: border.radius == "none" ||
			  border.radius == undefined ||
			  border.radius == ""
			? 1
			: 2
	);

	const PRIMARY_BACKGROUND_COLOR = getRootStyle("--primary-background-color");
	const PRIMARY_BORDER_COLOR = PRIMARY_BACKGROUND_COLOR;
	const PRIMARY_ICON_COLOR = getContrastingColor(PRIMARY_BACKGROUND_COLOR);
	const LIGHT_BACKGROUND_COLOR = getRootStyle("--light-background-color");
	const SECONDARY_BORDER_COLOR = LIGHT_BACKGROUND_COLOR;
	const SECONDARY_ICON_COLOR = getContrastingColor(LIGHT_BACKGROUND_COLOR);

	const [lineColor, setLineColor] = useState(INITIAL_LINE_COLOR);
	const [lineWidth, setLineWidth] = useState(INITIAL_LINE_WIDTH);
	const [borderRadius, setBorderRadius] = useState(RADIUS);

	const LABEL_ID = useId();

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
			{label && <Form.Label htmlFor={LABEL_ID}>{label}</Form.Label>}
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
					id={LABEL_ID}
					color={background}
					setColor={setBackground}
				/>
				<InputGroup className={"mx-4"} style={{ width: "auto" }}>
					<Button
						onClick={() => setSelectedOption(0)}
						style={{
							background:
								selectedOption == 0
									? PRIMARY_BACKGROUND_COLOR
									: LIGHT_BACKGROUND_COLOR,
							color:
								selectedOption == 0 ? PRIMARY_ICON_COLOR : SECONDARY_ICON_COLOR,
							borderColor:
								selectedOption == 0
									? PRIMARY_BORDER_COLOR
									: SECONDARY_BORDER_COLOR,
						}}
					>
						<FontAwesomeIcon icon={faBorderNone} />
					</Button>
					<Button
						onClick={() => setSelectedOption(1)}
						style={{
							background:
								selectedOption == 1
									? PRIMARY_BACKGROUND_COLOR
									: LIGHT_BACKGROUND_COLOR,
							color:
								selectedOption == 1 ? PRIMARY_ICON_COLOR : SECONDARY_ICON_COLOR,
							borderColor:
								selectedOption == 1
									? PRIMARY_BORDER_COLOR
									: SECONDARY_BORDER_COLOR,
						}}
					>
						<FontAwesomeIcon icon={faBorderAll} />
					</Button>
					<Button
						onClick={() => setSelectedOption(2)}
						style={{
							background:
								selectedOption == 2
									? PRIMARY_BACKGROUND_COLOR
									: LIGHT_BACKGROUND_COLOR,
							color:
								selectedOption == 2 ? PRIMARY_ICON_COLOR : SECONDARY_ICON_COLOR,
							borderColor:
								selectedOption == 2
									? PRIMARY_BORDER_COLOR
									: SECONDARY_BORDER_COLOR,
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
							defaultValue={RADIUS}
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
