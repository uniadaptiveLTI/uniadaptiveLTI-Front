import { useImperativeHandle, useLayoutEffect } from "react";
import { forwardRef } from "react";
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
				defaultChecked={defaultState[0]}
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

const QualificationForm = forwardRef(
	({ gradeConditionType, blockData, reactFlowInstance, initialGrade }, ref) => {
		const nodes = reactFlowInstance.getNodes();
		const [showExtra, setShowExtra] = useState(
			initialGrade?.hasConditions || false
		);
		const [maxError, setMaxError] = useState(false);
		// Refs

		const hasConditionsRef = useRef();
		const hasToBeSeenRef = useRef();
		const hasToBeQualifiedRef = useRef();

		const minRef = useRef();
		const maxRef = useRef();
		const hasToSelectRef = useRef();

		// IDs

		const minID = useId();
		const maxID = useId();

		function getRequired(type) {
			let requirementArray = [false, false, false];
			if (type == "quiz") requirementArray = [true, false, false];
			if (type != "quiz" && type != "choice")
				requirementArray = [true, true, false];
			//if (type == "choice") requirementArray = [false, false, false]; //unneeded
			return requirementArray;
		}

		function updateRef() {
			let qualificationResult = {};
			const requirementArray = getRequired(blockData.type);

			const checkedQualified = hasToBeQualifiedRef.current?.checked || false;
			const minValue = Number(minRef.current?.value) || 0;
			const maxValue =
				blockData.type != "quiz" ? Number(maxRef.current?.value) || 0 : 0;

			const getResult = () => {
				return {
					hasConditions: hasConditionsRef.current?.checked || false,
					hasToBeSeen: hasToBeSeenRef.current?.checked || false,
					hasToBeQualified: hasToBeQualifiedRef.current?.checked || false,
					data: hasConditionsRef.current?.checked
						? {
								min: minValue,
								max: maxValue,
								hasToSelect: hasToSelectRef.current?.checked || false,
						  }
						: {
								min: 0,
								max: 0,
								hasToSelect: false,
						  },
				};
			};

			//Tests if variables are correct
			if (checkedQualified) {
				if (
					!requirementArray[0] &&
					!requirementArray[1] &&
					!requirementArray[2]
				)
					return getResult();

				if (
					requirementArray[0] &&
					minValue > 0 &&
					!requirementArray[1] &&
					!requirementArray[2]
				)
					return getResult();

				if (
					requirementArray[0] &&
					minValue > 0 &&
					requirementArray[1] &&
					maxValue > 0 &&
					!maxError &&
					!requirementArray[2]
				)
					return getResult();

				return null;
			} else {
				return getResult();
			}
		}

		useImperativeHandle(ref, () => ({
			get data() {
				return updateRef();
			},
		}));

		return (
			<Form.Group
				style={{
					padding: "10px",
					border: "1px solid #C7C7C7",
					marginBottom: "10px",
				}}
				className="p-4"
			>
				{gradeConditionType == "simple" && (
					<Form.Check
						ref={hasToBeSeenRef}
						label={"El estudiante debe ver esta actividad para finalizarla"}
						defaultChecked={initialGrade?.hasToBeSeen || false}
					></Form.Check>
				)}

				{gradeConditionType != "simple" && (
					<>
						<Form.Check
							ref={hasConditionsRef}
							label={"La finalización de la actividad está condicionada"}
							defaultChecked={initialGrade?.hasConditions || false}
							onChange={(e) => setShowExtra(e.target.checked)}
						></Form.Check>

						<fieldset
							disabled={!showExtra}
							className="align-items-left"
							style={{
								display: "flex",
								flexDirection: "column",
								border:
									gradeConditionType != "choice" ? "1px solid #C7C7C7" : "none",
								padding: gradeConditionType != "choice" ? "10px" : "none",
								margin: gradeConditionType != "choice" ? "10px" : "none",
							}}
						>
							<Form.Check
								ref={hasToBeSeenRef}
								label={"El estudiante debe ver esta actividad para finalizarla"}
								defaultChecked={initialGrade?.hasToBeSeen || false}
							></Form.Check>
							<Form.Check
								ref={hasToBeQualifiedRef}
								label={
									"El estudiante debe ser calificado para que el recurso se considere finalizado"
								}
								defaultChecked={initialGrade?.hasToBeQualified || false}
							></Form.Check>

							<fieldset
								disabled={!hasToBeQualifiedRef?.current?.checked || false}
								style={{
									display: "flex",
									flexDirection: "column",
								}}
							>
								<div
									className=" align-items-baseline mb-2"
									style={{
										display: gradeConditionType != "choice" ? "flex" : "none",
									}}
								>
									<Form.Label htmlFor={minID} style={{ width: "350px" }}>
										Calificación para aprobar
									</Form.Label>
									<Form.Control
										ref={minRef}
										id={minID}
										type="number"
										step="0.01"
										min="1"
										max="10"
										defaultValue={initialGrade?.data?.min || 0.0}
									></Form.Control>
								</div>

								<div
									className="align-items-baseline mb-2"
									style={{
										display: !["normal", "choice"].includes(gradeConditionType)
											? "flex"
											: "none",
									}}
								>
									<Form.Label htmlFor={maxID} style={{ width: "350px" }}>
										Calificación máxima
									</Form.Label>
									<div className="d-flex flex-column w-100">
										<Form.Control
											ref={maxRef}
											id={maxID}
											type="number"
											step="0.01"
											min="1"
											max="10"
											isInvalid={maxError}
											onChange={(e) => {
												Number(e.target.value) < Number(minRef.current.value)
													? setMaxError(true)
													: setMaxError(false);
											}}
											defaultValue={
												!["normal", "choice"].includes(gradeConditionType)
													? typeof initialGrade?.data?.max === "number"
														? initialGrade.data.max
														: 10.0
													: 0
											}
										></Form.Control>
										<Form.Control.Feedback type="invalid">
											La calificación máxima no puede ser inferior a la
											necesitada para aprobar.
										</Form.Control.Feedback>
									</div>
								</div>
							</fieldset>

							<Form.Check
								ref={hasToSelectRef}
								label={"El estudiante debe seleccionar al menos una opción"}
								style={{
									display: gradeConditionType == "choice" ? "block" : "none",
								}}
								defaultChecked={Boolean(initialGrade?.hasToSelect) || false}
							></Form.Check>
						</fieldset>
					</>
				)}
			</Form.Group>
		);
	}
);

export default QualificationForm;
