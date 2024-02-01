import { useRef, RefObject } from "react";
import { Modal } from "react-bootstrap";
import UserSettingsLayout from "@components/layouts/UserSettingsLayout";
import UserSettingsPane, {
	UserSettingsPaneRef,
} from "@components/panes/usersettings/UserSettingsPane";

interface UserSettingsModalProps {
	showDialog: boolean;
	setShowDialog: (showDialog: boolean) => void;
	LTISettings: any; // Replace 'any' with the actual type of LTISettings
}

const UserSettingsModal: React.FC<UserSettingsModalProps> = ({
	showDialog,
	setShowDialog,
	LTISettings,
}) => {
	const paneRef = useRef<UserSettingsPaneRef>(); // Replace 'any' with the actual type of the ref
	const handleClose = () => {
		setShowDialog(false);
	};
	return (
		<Modal show={showDialog} onHide={handleClose} size="xl">
			<Modal.Header closeButton>
				<Modal.Title>Ajustes de usuario</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<UserSettingsLayout LTISettings={LTISettings} paneRef={paneRef}>
					<UserSettingsPane ref={paneRef}></UserSettingsPane>
				</UserSettingsLayout>
			</Modal.Body>
		</Modal>
	);
};

export default UserSettingsModal;
