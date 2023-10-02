import { useContext, useState, useRef, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { getNodeById } from "@utils/Nodes";
import { useReactFlow, useNodes } from "reactflow";
import { SettingsContext } from "/pages/_app";
import UserSettingsLayout from "@components/layouts/UserSettingsLayout";
import UserSettingsPane from "@components/panes/usersettings/UserSettingsPane";

export default function UserSettingsModal({
	showDialog,
	setShowDialog,
	LTISettings,
}) {
	const paneRef = useRef();
	function handleClose() {
		setShowDialog(false);
	}
	return (
		<Modal show={showDialog} onHide={() => handleClose()} size="xl">
			<Modal.Header closeButton>
				<Modal.Title>Ajustes de usuario</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<UserSettingsLayout LTISettings={LTISettings} paneRef={paneRef}>
					<UserSettingsPane
						LTISettings={LTISettings}
						ref={paneRef}
					></UserSettingsPane>
				</UserSettingsLayout>
			</Modal.Body>
		</Modal>
	);
}
