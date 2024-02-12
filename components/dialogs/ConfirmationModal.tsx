import React, { FC, ReactNode } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

interface ConfirmationModalProps {
	show: boolean;
	handleClose: () => void;
	backdrop?: boolean | "static";
	title: string;
	message: ReactNode | string;
	cancel?: string;
	confirm?: string;
	callbackCancel?: () => void;
	callbackConfirm?: () => void;
}

const ConfirmationModal: FC<ConfirmationModalProps> = ({
	show,
	handleClose,
	backdrop = "static",
	title,
	message,
	cancel = "Cancelar",
	confirm,
	callbackCancel,
	callbackConfirm,
}) => (
	<Modal
		show={show}
		onHide={handleClose}
		backdrop={backdrop ? "static" : false}
	>
		<Modal.Header closeButton>
			<Modal.Title>{title}</Modal.Title>
		</Modal.Header>
		<Modal.Body>{message}</Modal.Body>
		<Modal.Footer>
			{confirm && confirm.trim() !== "" && (
				<Button
					color="primary"
					onClick={() => {
						handleClose();
						if (callbackConfirm && typeof callbackConfirm == "function")
							callbackConfirm();
					}}
				>
					{confirm}
				</Button>
			)}
			<Button
				variant="primary"
				onClick={() => {
					handleClose();
					if (callbackCancel && typeof callbackCancel === "function")
						callbackCancel();
				}}
			>
				{cancel}
			</Button>
		</Modal.Footer>
	</Modal>
);

export default ConfirmationModal;