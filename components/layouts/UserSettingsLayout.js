import { getAutomaticReusableStyles, getRootStyle } from "@utils/Colors";
import { orderByPropertyAlphabetically } from "@utils/Utils";
import { useEffect, useLayoutEffect, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";

function ButtonLink({ label, scrollref, className, style }) {
	console.log(scrollref);
	return (
		<Button
			className={className}
			onClick={() =>
				scrollref.current.scrollIntoView({
					behavior: "smooth",
				})
			}
			style={style}
		>
			{label}
		</Button>
	);
}

export default function UserSettingsLayout({ children, paneRef, LTISettings }) {
	const [asideButtonStyles, setAsideButtonStyles] = useState();
	const [mainBgColor, setMainBgColor] = useState();
	const [renderButtons, setRenderButtons] = useState(false);
	const [currentPane, setCurrentPane] = useState(paneRef.current);
	const [currentPaneRefs, setCurrentPaneRefs] = useState([]);

	useEffect(() => {
		if (paneRef.current) {
			setCurrentPane(paneRef.current);
			const refs = [];
			Object.keys(paneRef.current).forEach((ref) =>
				refs.push(paneRef.current[ref])
			);
			setCurrentPaneRefs(orderByPropertyAlphabetically(refs, "name"));
			console.log(currentPaneRefs);
		}
	}, [paneRef.current]);

	useLayoutEffect(() => {
		setAsideButtonStyles({
			...getAutomaticReusableStyles("light", true, true, false),
		});
		setMainBgColor(getRootStyle("--main-ui-default-background"));
		setRenderButtons(true);
	}, []);

	return (
		<div>
			<Container>
				<Row>
					<Col xl="4" xxl="3">
						<aside
							className="border px-4 py-5"
							style={{
								display: "flex",
								flexDirection: "column",
								height: "100%",
								background: mainBgColor,
							}}
						>
							<img
								alt="Logo"
								className="mb-4"
								src={LTISettings.branding.logo_path}
							/>
							{currentPaneRefs.length > 0 &&
								currentPaneRefs.map((link) => (
									<ButtonLink
										className="py-3 my-2"
										key={link.name}
										label={link.name}
										scrollref={link.ref}
										style={{ ...asideButtonStyles }}
									/>
								))}
							{LTISettings.visibleAdminButton && renderButtons && (
								<Button
									className="py-3 mb-2"
									onClick={() => (window.location.href = "/admin")}
									style={{ ...asideButtonStyles, marginTop: "auto" }}
								>
									Panel de administración
								</Button>
							)}
							{/*renderButtons && (
								<Button
									className="py-3 my-2"
									style={asideButtonStyles}
									onClick={() => (window.location.href = "/")}
								>
									Volver
								</Button>
							)*/}
						</aside>
					</Col>

					<Col style={{ overflowY: "auto" }}>
						<div
							className="border p-5"
							style={{
								background: mainBgColor,
							}}
						>
							{children}
						</div>
					</Col>
				</Row>
			</Container>
		</div>
	);
}
