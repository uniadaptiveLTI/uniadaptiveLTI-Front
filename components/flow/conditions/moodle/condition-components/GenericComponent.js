import React, { useState } from "react";
import styles from "/styles/ConditionModalMoodle.module.css";
import {
	Container,
	Row,
	Col,
	Button,
	OverlayTrigger,
	Tooltip,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faArrowDown,
	faArrowUp,
	faCircleQuestion,
	faCode,
	faEdit,
	faEye,
	faEyeSlash,
	faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import { getConditionIcon } from "@utils/ConditionIcons";
import ConfirmationModal from "../../../../dialogs/ConfirmationModal";

function GenericComponent({
	condition,
	conditionsList,
	setConditionEdit,
	upCondition,
	downCondition,
	deleteCondition,
	swapConditionParam,
}) {
	const MAIN_CONDITION = conditionsList.c.some((c) => c.id === condition.id);
	const [showConditionCodeModal, setShowConditionCodeModal] = useState(false);
	const [showConditionDeleteModal, setShowConditionDeleteModal] =
		useState(false);

	const handleConditionCode = (key) => {
		if (key == undefined || key == "Enter" || key == "NumpadEnter") {
			setShowConditionCodeModal(true);
		}
	};

	const handleConditionDelete = (key) => {
		if (key == undefined || key == "Enter" || key == "NumpadEnter") {
			setShowConditionDeleteModal(true);
		}
	};

	return (
		<Container
			className="mb-3 mt-3"
			style={{ padding: "10px", border: "1px solid #CDCD00" }}
		>
			<Row className="align-items-center">
				{MAIN_CONDITION &&
					(conditionsList.op === "&" || conditionsList.op === "!|") && (
						<Col className="col-1">
							<Button
								variant="light"
								onClick={() => swapConditionParam(condition, "showc")}
							>
								<div>
									{condition.showc ? (
										<FontAwesomeIcon icon={faEye} />
									) : (
										<FontAwesomeIcon icon={faEyeSlash} />
									)}
								</div>
							</Button>
						</Col>
					)}
				<Col style={{ width: "550px", flex: "0 0 auto" }}>
					<div>Tipo: No soportado ({getConditionIcon("generic")})</div>
					<div>
						La condición del tipo{" "}
						<strong>
							{condition?.data?.type ? condition.data.type : "CODE_NOT_FOUND"}{" "}
							no está soportada
						</strong>{" "}
						por la herramienta{" "}
						<OverlayTrigger
							placement="right"
							overlay={
								<Tooltip>{`Las condiciones no soportadas no se podrán crear o editar. Para mantener el flujo de condiciones se podrán desplazar o eliminar.`}</Tooltip>
							}
							trigger={["hover", "focus"]}
						>
							<FontAwesomeIcon icon={faCircleQuestion} tabIndex={0} />
						</OverlayTrigger>
					</div>
				</Col>
				<Col className="col d-flex align-items-center justify-content-end gap-2">
					<Button variant="light" onClick={() => handleConditionCode()}>
						<div>
							<FontAwesomeIcon icon={faCode} />
						</div>
					</Button>
					<Button variant="light" onClick={() => handleConditionDelete()}>
						<div>
							<FontAwesomeIcon icon={faTrashCan} />
						</div>
					</Button>
					{conditionsList.c.length > 1 && (
						<>
							<Button variant="light" onClick={() => upCondition(condition)}>
								<div>
									<FontAwesomeIcon icon={faArrowUp} />
								</div>
							</Button>
							<Button variant="light" onClick={() => downCondition(condition)}>
								<div>
									<FontAwesomeIcon icon={faArrowDown} />
								</div>
							</Button>
						</>
					)}
				</Col>
				{(showConditionCodeModal || showConditionDeleteModal) && (
					<div className={styles.overlay}></div>
				)}
				{showConditionCodeModal && (
					<ConfirmationModal
						show={showConditionCodeModal}
						handleClose={setShowConditionCodeModal}
						title="Código interno de la condición"
						message={JSON.stringify(condition?.data)}
					/>
				)}
				{showConditionDeleteModal && (
					<ConfirmationModal
						show={showConditionDeleteModal}
						handleClose={setShowConditionDeleteModal}
						backdrop={true}
						title="Confirmación de eliminación de condición"
						message="¿ Desea eliminar la condición ? Esta no se podrá volver a crear debido a que es una condición no soportada"
						confirm="Confirmar"
						callbackConfirm={() => deleteCondition(condition.id)}
					/>
				)}
			</Row>
		</Container>
	);
}

export default GenericComponent;
