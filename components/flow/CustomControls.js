import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faMap,
	faX,
	faFlagCheckered,
	faMagnifyingGlassPlus,
	faMagnifyingGlassMinus,
	faArrowsToDot,
	faLock,
	faLockOpen,
	faSquare,
	faSquarePollHorizontal,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "react-bootstrap";
import { useState, useContext } from "react";
import { SettingsContext } from "pages/_app";
import { useLayoutEffect } from "react";

export default function CustomControls({
	reactFlowInstance,
	minimap,
	interactive,
	setMinimap,
	setInteractive,
	fitViewOptions,
}) {
	const { settings, setSettings } = useContext(SettingsContext);
	const parsedSettings = JSON.parse(settings);
	const [details, setDetails] = useState(parsedSettings.showDetails);
	const toggleDetails = () => setDetails(!details);
	const toggleInteractive = () => setInteractive(!interactive);
	const toggleMinimap = () => setMinimap(!minimap);
	const fitMap = () => {
		reactFlowInstance.fitView(fitViewOptions);
	};
	const zoomIn = () => {
		reactFlowInstance.zoomIn();
	};
	const zoomOut = () => {
		reactFlowInstance.zoomOut();
		console.log(reactFlowInstance);
	};

	useLayoutEffect(() => {
		//Set settings with changes
		const newSettings = JSON.parse(settings);
		newSettings.showDetails = details;
		setSettings(JSON.stringify(newSettings));
	}, [details]);

	useLayoutEffect(() => {
		//React to settings changes
		const newSettings = JSON.parse(settings);
		setDetails(newSettings.showDetails);
	}, [settings]);

	return (
		<div className="react-flow__controls">
			<Button title="Zoom in" onClick={zoomIn} variant="light">
				<FontAwesomeIcon icon={faMagnifyingGlassPlus} />
			</Button>
			<Button title="Zoom out" onClick={zoomOut} variant="light">
				<FontAwesomeIcon icon={faMagnifyingGlassMinus} />
			</Button>
			<Button title="Fit map" onClick={fitMap} variant="light">
				<FontAwesomeIcon icon={faArrowsToDot} />
			</Button>
			<Button title="Show/hide details" onClick={toggleDetails} variant="light">
				<FontAwesomeIcon icon={details ? faSquarePollHorizontal : faSquare} />
			</Button>
			<Button
				title="Lock/unlock pan"
				onClick={toggleInteractive}
				variant="light"
			>
				<FontAwesomeIcon icon={interactive ? faLockOpen : faLock} />
			</Button>
			<Button title="Toggle Minimap" onClick={toggleMinimap} variant="light">
				{!minimap && <FontAwesomeIcon icon={faMap} />}
				{minimap && (
					<div
						style={{
							position: "relative",
							padding: "none",
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							width: "18px",
							height: "24px",
						}}
					>
						<FontAwesomeIcon
							icon={faX}
							style={{ position: "absolute", top: "4px" }}
							color="white"
						/>
						<FontAwesomeIcon icon={faMap} />
					</div>
				)}
			</Button>
		</div>
	);
}
