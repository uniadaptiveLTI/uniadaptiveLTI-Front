import { getRootStyle } from "@utils/Colors";
import { Col, Container, Row } from "react-bootstrap";

export default function UISelection({
	currentSelection = -1,
	setSelection = () => {},
}) {
	const selectedStyle = {
		background: getRootStyle("--main-third-background-color"),
		border: "var(--main-borders)",
	};
	const unselectedStyle = {
		background: getRootStyle("--main-background-color"),
		border: "var(--main-borders)",
	};

	return (
		<Container fluid style={{ width: "400px", height: "250px" }}>
			<Row>
				<Col
					onClick={() => setSelection(0)}
					onKeyDown={(e) => {
						if (e.key == "Enter") {
							setSelection(0);
						}
					}}
					role="button"
					tabIndex={0}
					style={{
						height: "250px",
						maxWidth: "100px",
						display: "flex",
						flexDirection: "column",
						marginRight: "4px",
						...(currentSelection == 0 ? selectedStyle : unselectedStyle),
						//Aside
					}}
				>
					<div
						style={{
							height: "40px",
							marginTop: "10px",
							...(currentSelection == 0 ? selectedStyle : unselectedStyle),
						}}
					></div>
				</Col>
				<Col>
					<Row
						onClick={() => setSelection(1)}
						onKeyDown={(e) => {
							if (e.key == "Enter") {
								setSelection(1);
							}
						}}
						role="button"
						tabIndex={0}
						style={{
							height: "50px",
							display: "flex",
							alignContent: "center",
							marginBottom: "4px",
							...(currentSelection == 1 ? selectedStyle : unselectedStyle),
							//Header
						}}
					>
						<div
							style={{
								height: "15px",
								maxWidth: "200px",
								marginLeft: "15px",
								...(currentSelection == 1 ? selectedStyle : unselectedStyle),
							}}
						></div>
					</Row>
					<Row
						onClick={() => setSelection(2)}
						onKeyDown={(e) => {
							if (e.key == "Enter") {
								setSelection(2);
							}
						}}
						role="button"
						tabIndex={0}
						style={{
							position: "relative",
							height: "196px",
							...(currentSelection == 2 ? selectedStyle : unselectedStyle),
							//Blockflow
						}}
					>
						<div
							onClick={(e) => {
								e.stopPropagation(e);
								setSelection(3);
							}}
							onKeyDown={(e) => {
								if (e.key == "Enter") {
									e.stopPropagation(e);
									setSelection(3);
								}
							}}
							role="button"
							tabIndex={0}
							style={{
								position: "absolute",
								height: "100px",
								width: "25px",
								left: "10px",
								bottom: "10px",
								...(currentSelection == 3 ? selectedStyle : unselectedStyle),
								//Blockflow--Controls
							}}
						></div>
						<div
							onClick={(e) => {
								e.stopPropagation(e);
								setSelection(4);
							}}
							onKeyDown={(e) => {
								if (e.key == "Enter") {
									e.stopPropagation(e);
									setSelection(4);
								}
							}}
							role="button"
							tabIndex={0}
							style={{
								position: "absolute",
								height: "60px",
								width: "100px",
								right: "10px",
								bottom: "10px",
								...(currentSelection == 4 ? selectedStyle : unselectedStyle),
								//Blockflow--Minimap
							}}
						></div>
					</Row>
				</Col>
			</Row>
		</Container>
	);
}
