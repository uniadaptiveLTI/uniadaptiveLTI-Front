import { useId, useRef, useState } from "react";
import { Button, Form } from "react-bootstrap";

const EnabledInput = ({
	checkRef,
	inputRef,
	inputType = "text",
	label = "Input",
	defaultState = [false, undefined],
	step = 1,
	min = 0,
	max = 10,
	...props
}) => {
	const [enableInput, setEnableInput] = useState(defaultState[0]);
	return (
		<div
			className="d-flex align-items-baseline col-12 col-lg-5 col-xl-4"
			{...props}
		>
			<Form.Check
				className="me-4"
				style={{ minWidth: "125px" }}
				ref={checkRef}
				label={label}
				onChange={() => setEnableInput(!enableInput)}
				checked={defaultState[0]}
			></Form.Check>
			<Form.Control
				disabled={!enableInput}
				ref={inputRef}
				type={inputType}
				step={inputType == "number" ? step : undefined}
				min={inputType == "number" ? min : undefined}
				max={inputType == "number" ? max : undefined}
				defaultValue={defaultState[1]}
			></Form.Control>
		</div>
	);
};

export default function QualificationForm({ gradeConditionType }) {
	const [showExtra, setShowExtra] = useState(false);
	const [showExtra2, setShowExtra2] = useState(false);
	const [showExtra3, setShowExtra3] = useState(false);

	const qualificationResult = useRef({});

	// Refs

	const completionTrackingRef = useRef();
	const hasToBeSeenRef = useRef();
	const hastToBeQualifiedRef = useRef();
	const qualificationToPassRef = useRef();
	const attemptsAllowedRef = useRef();
	const qualificationMethodRef = useRef();
	const requiredTypeRef = useRef();
	const hasTimeLimitRef = useRef();
	const timeLimitRef = useRef();

	const requireQualificationRef = useRef();
	const hasToRequireMessagesRef = useRef();
	const requireMessagesRef = useRef();

	// IDs

	const completionTrackingID = useId();
	const qualificationToPassID = useId();
	const attemptsAllowedID = useId();
	const qualificationMethodID = useId();
	const requiredTypeID = useId();

	const requireQualificationID = useId();

	function updateRef() {
		if (gradeConditionType == "normal") {
			qualificationResult.current = {
				completionTracking: completionTrackingRef.current.value,
				hasToBeSeen: hasToBeSeenRef.current?.checked || false,
				hastToBeQualified: hastToBeQualifiedRef.current?.checked || false,
				qualificationToPass: Number(qualificationToPassRef.current?.value) || 0,
				attemptsAllowed: Number(attemptsAllowedRef.current?.value) || 0,
				qualificationMethod: Number(qualificationMethodRef.current?.value) || 0,
				requiredType: Number(requiredTypeRef.current?.value) || 0,
				hasTimeLimit: hasTimeLimitRef.current?.checked || false,
				timeLimit: timeLimitRef.current?.value || "",
			};
		}

		if (gradeConditionType == "consolidable") {
			qualificationResult.current = {
				completionTracking: completionTrackingRef.current.value,
				hasToBeSeen: hasToBeSeenRef.current?.checked || false,
				hastToBeQualified: hastToBeQualifiedRef.current?.checked || false,
				qualificationToPass: Number(qualificationToPassRef.current?.value) || 0,
				attemptsAllowed: Number(attemptsAllowedRef.current?.value) || 0,
				qualificationMethod: Number(qualificationMethodRef.current?.value) || 0,
				requiredType: Number(requiredTypeRef.current?.value) || 0,
				hasTimeLimit: hasTimeLimitRef.current?.checked || false,
				timeLimit: timeLimitRef.current?.value || "",
			};
		}
	}

	new Date().toLocaleDateString();

	return (
		<Form.Group
			style={{
				padding: "10px",
				border: "1px solid #C7C7C7",
				marginBottom: "10px",
			}}
			className="p-4"
		>
			<p style={{ maxWidth: "46em", lineBreak: "anywhere" }}>
				{JSON.stringify(qualificationResult.current) + "\n"}
			</p>
			<Form.Label htmlFor={completionTrackingID} style={{ width: "350px" }}>
				Rastreo de finalización
			</Form.Label>
			<Form.Select
				ref={completionTrackingRef}
				id={completionTrackingID}
				defaultValue={0}
			>
				{[
					{ value: 0, name: "No indicar finalización de la actividad" },
					{
						value: 1,
						name: "Los estudiantes pueden marcar manualmente la actividad como completada",
					},
					{
						value: 2,
						name: "Mostrar la actividad como completada cuando se cumplan las condiciones",
					},
				].map((op) => (
					<option value={op.value}>{op.name}</option>
				))}
			</Form.Select>
			{completionTrackingRef.current?.value == 1 && (
				<Form.Group
					style={{
						padding: "10px",
						border: "1px solid #C7C7C7",
						marginBottom: "10px",
					}}
					className="m-4 p-4"
				>
					<Form.Check
						onChange={(e) => {
							setShowExtra2(e.target.checked);
						}}
						label={"Fecha límite de finalización"}
						ref={hasTimeLimitRef}
						defaultChecked={showExtra2}
					></Form.Check>
					{showExtra2 && (
						<Form.Control
							ref={timeLimitRef}
							type="datetime-local"
						></Form.Control>
					)}
				</Form.Group>
			)}
			{completionTrackingRef.current?.value == 2 && (
				<Form.Group
					style={{
						padding: "10px",
						border: "1px solid #C7C7C7",
						marginBottom: "10px",
					}}
					className="m-4 p-4"
				>
					{gradeConditionType == "normal" && (
						<>
							<Form.Check
								ref={hasToBeSeenRef}
								label={"El estudiante debe ver esta actividad para finalizarla"}
							></Form.Check>
							<Form.Check
								onChange={(e) => {
									setShowExtra(e.target.checked);
								}}
								ref={hastToBeQualifiedRef}
								label={
									"El estudiante debe recibir una calificación para finalizar esta actividad"
								}
								defaultChecked={showExtra}
							></Form.Check>
							{showExtra && (
								<Form.Group
									style={{
										padding: "10px",
										border: "1px solid #C7C7C7",
										marginBottom: "10px",
									}}
									className="m-4 p-4"
								>
									<div className="d-flex align-items-center mb-2">
										<Form.Label
											htmlFor={qualificationToPassID}
											style={{ width: "350px" }}
										>
											Calificación para aprobar
										</Form.Label>
										<Form.Control
											ref={qualificationToPassRef}
											id={qualificationToPassID}
											defaultValue={0.0}
											type="number"
											step="0.01"
											min="0"
											max="10"
										></Form.Control>
									</div>
									<div className="d-flex align-items-center mb-2">
										<Form.Label
											htmlFor={attemptsAllowedID}
											style={{ width: "350px" }}
										>
											Intentos permitidos
										</Form.Label>
										<Form.Select
											ref={attemptsAllowedRef}
											id={attemptsAllowedID}
											defaultValue={-1}
										>
											<option value={-1}>Sin límite</option>
											{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
												<option value={n}>{n}</option>
											))}
										</Form.Select>
									</div>
									<div className="d-flex align-items-center mb-2">
										<Form.Label
											htmlFor={qualificationMethodID}
											style={{ width: "350px" }}
										>
											Método de calificación
										</Form.Label>
										<Form.Select
											ref={qualificationMethodRef}
											id={qualificationMethodID}
											defaultValue={0}
										>
											{[
												{ value: 0, name: "Calificación más alta" },
												{ value: 1, name: "Promedio de calificaciones" },
												{ value: 2, name: "Primer intento" },
												{ value: 3, name: "Último intento" },
											].map((op) => (
												<option value={op.value}>{op.name}</option>
											))}
										</Form.Select>
									</div>
									<div className="d-flex align-items-center mb-2">
										<Form.Label
											htmlFor={requiredTypeID}
											style={{ width: "350px" }}
										>
											Requerir calificación aprobatoria
										</Form.Label>
										<Form.Select
											ref={requiredTypeRef}
											id={requiredTypeID}
											defaultValue={0}
										>
											{[
												{
													value: 0,
													name: "No requerir calificación aprobatoria para considerarse finalizado",
												},
												{
													value: 1,
													name: "Requerir calificación aprobatoria para considerarse finalizado",
												},
												{
													value: 2,
													name: "Requerir calificación aprobatoria o consumir todos los intentos disponibles para considerarse finalizado",
												},
											].map((op) => (
												<option value={op.value}>{op.name}</option>
											))}
										</Form.Select>
									</div>
									<Form.Check
										onChange={(e) => {
											setShowExtra2(e.target.checked);
										}}
										label={"Fecha límite de finalización"}
										ref={hasTimeLimitRef}
										defaultChecked={showExtra2}
									></Form.Check>
									{showExtra2 && (
										<Form.Control
											ref={timeLimitRef}
											type="datetime-local"
										></Form.Control>
									)}
								</Form.Group>
							)}
						</>
					)}

					{/*----------------------------------*/}

					{gradeConditionType == "consolidable" && (
						<>
							<Form.Check
								ref={hasToBeSeenRef}
								label={"El estudiante debe ver esta actividad para finalizarla"}
							></Form.Check>
							<Form.Label htmlFor={requireQualificationID}></Form.Label>
							<Form.Select
								ref={requireQualificationRef}
								id={requireQualificationID}
								defaultValue={0}
							>
								{[
									{ value: 0, name: "Calificación no requerida" },
									{ value: 1, name: "Calificación" },
									{ value: 2, name: "Foro completo" },
								].map((op) => (
									<option value={op.value}>{op.name}</option>
								))}
							</Form.Select>
							<EnabledInput
								className={"mt-4 mb-4"}
								checkRef={hasToRequireMessagesRef}
								inputRef={requireMessagesRef}
								inputType="number"
								label="El usuario debe aportar debates o réplicas:"
								defaultState={[false, 0]}
								min={0}
							></EnabledInput>
							<EnabledInput
								className={"mt-4 mb-4"}
								checkRef={hasToRequireMessagesRef}
								inputRef={requireMessagesRef}
								inputType="number"
								label="El usuario debe crear debates:"
								defaultState={[false, 0]}
								min={0}
							></EnabledInput>
							<EnabledInput
								className={"mt-4 mb-4"}
								checkRef={hasToRequireMessagesRef}
								inputRef={requireMessagesRef}
								inputType="number"
								label="El usuario debe enviar réplicas:"
								defaultState={[false, 0]}
								min={0}
							></EnabledInput>
							<Form.Check
								onChange={(e) => {
									setShowExtra2(e.target.checked);
								}}
								label={"Fecha límite de finalización"}
								ref={hasTimeLimitRef}
								defaultChecked={showExtra2}
								defaultState={[false, 0]}
							></Form.Check>
							{showExtra2 && (
								<Form.Control
									ref={timeLimitRef}
									type="datetime-local"
								></Form.Control>
							)}
						</>
					)}
				</Form.Group>
			)}

			<Button onClick={updateRef}>Test</Button>
		</Form.Group>
	);
}
