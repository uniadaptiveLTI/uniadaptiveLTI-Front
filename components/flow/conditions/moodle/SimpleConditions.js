import { useNodes } from "reactflow";
import { getNodeById } from "@utils/Nodes";
import { DevModeStatusContext } from "@root/pages/_app";
import { useContext } from "react";
import { getTypeIcon } from "@utils/NodeIcons";
import { MetaDataContext, PlatformContext, SettingsContext } from "pages/_app";
import { deduplicateById } from "@utils/Utils";
import {
	profileOperatorList,
	profileQueryList,
} from "./condition-components/ProfileComponent";

export default function SimpleConditions({ id }) {
	const { devModeStatus } = useContext(DevModeStatusContext);
	const { metaData } = useContext(MetaDataContext);
	const rfNodes = useNodes();
	const { platform } = useContext(PlatformContext);
	const conditions = getNodeById(id, rfNodes)?.data?.c || undefined;
	const qualifications = getNodeById(id, rfNodes)?.data?.g || undefined;
	const { settings } = useContext(SettingsContext);
	const parsedSettings = JSON.parse(settings);
	let { hoverConditions } = parsedSettings;

	const flattenConditions = (conditions) => {
		const recursiveGet = (c, identation = 1, array = []) => {
			if (c.c) {
				c.c.forEach((condition) => {
					array.push({ ...condition, identation, c: null });
					if (condition.c) {
						array.push(...recursiveGet(condition, identation + 1, array));
					}
				});
			}
			return deduplicateById(array);
		};
		return [
			{ ...conditions, identation: 0, c: null },
			...recursiveGet(conditions),
		];
	};

	const parseConditions = (flatConditions) => {
		let finalDOM = [
			<p>
				<b>Condiciones:</b>
			</p>,
		];
		flatConditions.map((c) => {
			const prefix = { marginLeft: 24 * c.identation + "px" };
			switch (c.type) {
				case "conditionsGroup":
					finalDOM.push(
						<p style={prefix}>
							{c.op == "|" ? (
								<b>Si se cumple UNO:</b>
							) : (
								<b>Si se cumplen TODOS:</b>
							)}
						</p>
					);
					break;
				case "completion":
					const e = [
						"no completado.",
						"completado.",
						"completado y aprobado.",
						"completado y suspendido.",
					];
					finalDOM.push(
						<p style={prefix}>
							{getTypeIcon(getNodeById(c.cm, rfNodes).type, platform)}
							{
								<span style={{ marginLeft: "4px" }}>
									<b>
										{getNodeById(c.cm, rfNodes).data.label} {e[c.e]}
									</b>
								</span>
							}
						</p>
					);
					break;
				case "courseGrade":
					if (c.min && c.max) {
						finalDOM.push(
							<p style={prefix}>
								La nota del curso entre: <b>{c.min}</b> y <b>{c.max}</b>
							</p>
						);
					}
					if (c.min && c.max == undefined) {
						finalDOM.push(
							<p style={prefix}>
								La nota del curso superará a: <b>{c.min}</b>
							</p>
						);
					}
					if (c.min == undefined && c.max) {
						finalDOM.push(
							<p style={prefix}>
								La nota del curso será inferior a: <b>{c.max}</b>
							</p>
						);
					}
					break;
				case "date":
					const parsedDate = new Date(c.t).toLocaleDateString("es-ES");
					if (parsedDate != "Invalid Date")
						finalDOM.push(
							<p style={prefix}>
								{
									(c.d = ">=" ? (
										<>
											A partir del: <b>{parsedDate}</b>
										</>
									) : (
										<>
											Antes del: <b>{parsedDate}</b>
										</>
									))
								}
							</p>
						);
					break;
				case "grade":
					{
						let sufix;
						if (c.min && c.max) {
							sufix = (
								<>
									entre: <b>{c.min}</b> y <b>{c.max}</b>
								</>
							);
						}
						if (c.min && c.max == undefined) {
							sufix = (
								<>
									superará: <b>{c.min}</b>
								</>
							);
						}
						if (c.min == undefined && c.max) {
							sufix = (
								<>
									inferior a: <b>{c.max}</b>
								</>
							);
						}

						finalDOM.push(
							<p style={prefix}>
								{getTypeIcon(getNodeById(c.cm, rfNodes).type, platform)}
								{
									<span style={{ marginLeft: "4px" }}>
										<b>{getNodeById(c.cm, rfNodes).data.label}</b> {sufix}
									</span>
								}
							</p>
						);
					}
					break;
				case "group":
					finalDOM.push(
						<p style={prefix}>
							{
								<>
									Grupo:{" "}
									<b>
										{c.groupId == null
											? "Cualquier grupo"
											: metaData.groups.find((g) => g.id == c.groupId).name}
									</b>
								</>
							}
						</p>
					);
					break;
				case "grouping":
					finalDOM.push(
						<p style={prefix}>
							{
								<>
									Agrupamiento:{" "}
									<b>
										{c.groupingId == null
											? "Cualquier agrupamiento"
											: metaData.grupings.find((g) => g.id == c.groupingId)
													.name}
									</b>
								</>
							}
						</p>
					);
					break;
				case "profile":
					{
						finalDOM.push(
							<p style={prefix}>
								{
									<>
										Perfil:{" "}
										<b>
											{profileOperatorList.find((sf) => c.sf == sf.value).name}{" "}
											{profileQueryList.find((op) => c.op == op.value).name}{" "}
											{c.v}
										</b>
									</>
								}
							</p>
						);
					}
					break;
				default:
					break;
			}
		});
		console.log(finalDOM);
		return finalDOM;
	};

	const parseQualifications = (q) => {
		let finalDOM = [
			<p>
				<b>Calificaciones:</b>
			</p>,
		];
		if (q && q.completionTracking == 0) {
			finalDOM.push(<b>Sin indicación de finalización de actividad.</b>);
		}
		if (q && q.completionTracking == 1) {
			finalDOM.push(
				<p>
					<b>Manualmente marcado como finalizado por estudiantes.</b>
				</p>
			);
			if (q.hasTimeLimit && q.timeLimit) {
				const parsedDate = new Date(q.timeLimit).toLocaleDateString("es-ES");
				if (parsedDate != "Invalid Date")
					finalDOM.push(
						<p style={{ marginLeft: 24 }}>
							Con fecha límite de <b>{parsedDate}</b>.
						</p>
					);
			}
		}
		if (q && q.completionTracking == 2) {
			finalDOM.push(
				<p>
					<b>Completada cuando las siguientes condiciones se cumplan:</b>
				</p>
			);
			if (q.hasToBeSeen)
				finalDOM.push(
					<p style={{ marginLeft: 24 }}>Ver esta actividad para finalizarla.</p>
				);

			if (q.hasToBeQualified)
				finalDOM.push(
					<p style={{ marginLeft: 24 }}>
						Recibir una calificación para finalizarla.
					</p>
				);
			if (q.hasToBeQualified)
				finalDOM.push(
					<>
						<p style={{ marginLeft: 48 }}>
							Calificación necesaria para aprobar:{" "}
							<b>{q.qualificationToPass}</b>.
						</p>
						<p style={{ marginLeft: 48 }}>
							Intentos permitidos:{" "}
							<b>{q.attemptsAllowed < 1 ? "Sin límite" : q.attemptsAllowed}</b>
						</p>
						<p style={{ marginLeft: 48 }}>
							Método de calificación:{" "}
							<b>
								{
									[
										"Calificación más alta",
										"Promedio de calificaciones",
										"Primer intento",
										"Último intento",
									][q.attemptsAllowed]
								}
							</b>
						</p>
						<p style={{ marginLeft: 48 }}>
							Requerir calificación aprobatoria:{" "}
							<b>
								{
									["No", "Sí", "Sí o consumir todos los intentos"][
										q.requiredType
									]
								}
							</b>
						</p>
					</>
				);
			if (q.hasToBeQualified && q.hasTimeLimit && q.timeLimit) {
				const parsedDate = new Date(q.timeLimit).toLocaleDateString("es-ES");
				if (parsedDate != "Invalid Date") {
					finalDOM.push(
						<p style={{ marginLeft: 48 }}>
							Con fecha límite de <b>{parsedDate}</b>.
						</p>
					);
				}
			}
		}
		return finalDOM;
	};

	if (devModeStatus) {
		return JSON.stringify(getNodeById(id, rfNodes));
	} else {
		if (
			(conditions && hoverConditions) ||
			(qualifications && !hoverConditions)
		) {
			//Show the preference
			let finalString = hoverConditions
				? parseConditions(flattenConditions(conditions))
				: parseQualifications(qualifications);
			return <div>{finalString}</div>;
		} else {
			//If unable to show the preference, show the alternative
			if (conditions && !qualifications) {
				let finalString = parseConditions(flattenConditions(conditions));
				return <div>{finalString}</div>;
			} else {
				if (!conditions && qualifications) {
					let finalString = parseQualifications(qualifications);
					return <div>{finalString}</div>;
				} else {
					return (
						<div>
							Aquí se priorizará mostrará información resumida sobre las{" "}
							<b>{hoverConditions ? "condiciones" : "calificaciones"}</b> el
							bloque seleccionado.
						</div>
					);
				}
			}
		}
	}
}
