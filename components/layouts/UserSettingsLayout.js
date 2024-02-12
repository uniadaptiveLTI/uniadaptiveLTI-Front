import { getAutomaticReusableStyles, getRootStyle } from "@utils/Colors";
import { orderByPropertyAlphabetically } from "@utils/Utils";
import { useContext, useEffect, useLayoutEffect, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { parseBool } from "../../utils/Utils";
import Link from "next/link";
import { MetaDataContext } from "pages/_app";
import { Platforms } from "@utils/Platform";

function ButtonLink({ label, variant, scrollref, className, style }) {
	return (
		<Button
			variant={variant}
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
	const { metaData, setMetaData } = useContext(MetaDataContext);
	const [mainBgColor, setMainBgColor] = useState();
	const [renderButtons, setRenderButtons] = useState(false);
	const [currentPane, setCurrentPane] = useState(paneRef.current);
	const [currentPaneRefs, setCurrentPaneRefs] = useState([]);

	useEffect(() => {
		if (paneRef.current) {
			setCurrentPane(paneRef.current);
			const REFS = [];
			Object.keys(paneRef.current).forEach((ref) =>
				REFS.push(paneRef.current[ref])
			);
			setCurrentPaneRefs(orderByPropertyAlphabetically(REFS, "name"));
		}
	}, [paneRef.current]);

	useLayoutEffect(() => {
		setMainBgColor(getRootStyle("--main-background-color"));
		setRenderButtons(true);
	}, []);

	const devPlataformChange = () => {
		if (metaData.platform == Platforms.Moodle) {
			setMetaData({ ...metaData, platform: Platforms.Sakai });
		} else {
			setMetaData({ ...metaData, platform: Platforms.Moodle });
		}
	};

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
										variant="light"
										className="py-3 my-2"
										key={link.name}
										label={link.name}
										scrollref={link.ref}
									/>
								))}
							{parseBool(process.env.NEXT_PUBLIC_DEV_MODE) && renderButtons && (
								<Button
									variant="dark"
									className="py-3 mb-2"
									onClick={devPlataformChange}
									style={{
										color: "white",
										...getAutomaticReusableStyles("dev", true, true, false),
										marginTop: "auto",
									}}
								>
									Cambiar plataforma
								</Button>
							)}
							{LTISettings.visibleAdminButton && renderButtons && (
								<Link
									href="/admin"
									style={{ marginTop: "auto", width: "100%" }}
								>
									<Button
										variant="light"
										className="py-3 mb-2"
										style={{ width: "100%" }}
									>
										Panel de administración
									</Button>
								</Link>
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
