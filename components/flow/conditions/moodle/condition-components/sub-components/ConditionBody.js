import React from "react";
import { Col, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getConditionIcon } from "@utils/ConditionIcons";
import { parseDate } from "@utils/Utils";
import { useReactFlow } from "reactflow";
import { faCircleQuestion } from "@fortawesome/free-solid-svg-icons";

const ConditionBody = ({
	condition,
	completionQueryList,
	moodleGroups,
	moodleGroupings,
	profileQueryList,
	profileOperatorList,
	conditionsGroupOperatorList,
}) => {
	const reactFlowInstance = useReactFlow();
	const NODES = reactFlowInstance.getNodes();

	const GROUP = moodleGroups.find((group) => group.id === condition?.groupId);
	const GROUPING_FOUNDED = moodleGroupings.find(
		(grouping) => grouping.id == condition.groupingId
	);
	const NODE = NODES.find((node) => node.id === condition?.cm);

	return (
		<>
			<Col style={{ width: "531px", flex: "0 0 auto" }}>
				{(() => {
					switch (condition.type) {
						case "date":
							return (
								<>
									Tipo: Fecha ({getConditionIcon("date")})
									{condition.d === ">=" && (
										<div>
											En esta fecha <strong>{parseDate(condition.t)}</strong> o
											después
										</div>
									)}
									{condition.d === "<" && (
										<div>
											Antes del final de{" "}
											<strong>{parseDate(condition.t)}</strong>
										</div>
									)}
								</>
							);
						case "grade":
							return (
								<>
									<div>Tipo: Calificación</div>
									<div>
										{condition.min && !condition.max && (
											<div>
												La puntuación debe ser{" "}
												<strong>
													{">="} {condition.min}
												</strong>{" "}
												en <strong>{NODE.data.label}</strong>
											</div>
										)}
										{!condition.min && condition.max && (
											<div>
												La puntuación debe ser{" "}
												<strong>
													{"<"} {condition.max}
												</strong>{" "}
												en <strong>{NODE.data.label}</strong>
											</div>
										)}
										{condition.min && condition.max && (
											<div>
												La puntuación debe ser{" "}
												<strong>
													{">="} {condition.min}
												</strong>{" "}
												y{" "}
												<strong>
													{"<"} {condition.max}
												</strong>{" "}
												en <strong>{NODE.data.label}</strong>
											</div>
										)}
									</div>
								</>
							);
						case "courseGrade":
							return (
								<>
									<div>
										Tipo: Calificación total del curso (
										{getConditionIcon("courseGrade")})
									</div>
									<div>
										{condition.min && !condition.max && (
											<div>
												La puntuación <strong>total del curso</strong> debe ser{" "}
												<strong>
													{">="} {condition.min}
												</strong>
											</div>
										)}
										{!condition.min && condition.max && (
											<div>
												La puntuación <strong>total del curso</strong> debe ser{" "}
												<strong>
													{"<"} {condition.max}
												</strong>
											</div>
										)}
										{condition.min && condition.max && (
											<div>
												La puntuación <strong>total del curso</strong> debe ser{" "}
												<strong>
													{">="} {condition.min}
												</strong>{" "}
												y{" "}
												<strong>
													{"<"} {condition.max}
												</strong>
											</div>
										)}
									</div>
								</>
							);
						case "completion":
							return (
								<>
									<div>Tipo: Finalización</div>
									<div>
										La actividad <strong>{NODE.data.label}</strong>{" "}
										{
											completionQueryList.find(
												(item) => item.id === condition.e
											)?.name
										}
									</div>
								</>
							);
						case "group":
							return (
								<>
									<div>Tipo: Grupo ({getConditionIcon("group")})</div>
									<div>
										{!GROUP && (
											<div>
												Se pertenezca a <strong>cualquier grupo</strong>
											</div>
										)}
										{GROUP && (
											<div>
												Se pertenezca al grupo <strong>{GROUP.name}</strong>
											</div>
										)}
									</div>
								</>
							);
						case "grouping":
							return (
								<>
									<div>Tipo: Agrupamiento ({getConditionIcon("grouping")})</div>
									<div>
										Se pertenezca al agrupamiento{" "}
										<strong>{GROUPING_FOUNDED.name}</strong>
									</div>
								</>
							);
						case "profile":
							return (
								<>
									<div>
										Tipo: Perfil de usuario ({getConditionIcon("profile")})
									</div>
									<div>
										Su{" "}
										<strong>
											{
												profileOperatorList.find(
													(item) => item.value === condition.sf
												)?.name
											}
										</strong>{" "}
										{
											profileQueryList.find(
												(item) => item.value === condition.op
											)?.name
										}{" "}
										<strong>{condition.v}</strong>
									</div>
								</>
							);
						case "conditionsGroup":
							return (
								<>
									<div>Tipo: Conjunto de condiciones</div>
									<div>
										<strong>
											{
												conditionsGroupOperatorList.find(
													(item) => item.value === condition.op
												)?.name
											}
										</strong>
									</div>
								</>
							);
						case "generic":
							return (
								<>
									<div>Tipo: No soportado ({getConditionIcon("generic")})</div>
									<div>
										La condición del tipo{" "}
										<strong>
											{condition?.data?.type
												? condition.data.type
												: "CODE_NOT_FOUND"}{" "}
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
								</>
							);

						default:
							return null;
					}
				})()}
			</Col>
		</>
	);
};

export default ConditionBody;
