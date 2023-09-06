import { useNodes } from "reactflow";
import { getNodeById } from "@utils/Nodes";
import { DevModeStatusContext } from "@root/pages/_app";
import { useContext } from "react";
import { getTypeIcon } from "@utils/NodeIcons";
import { MetaDataContext, PlatformContext, SettingsContext } from "pages/_app";
import { deduplicateById, parseDate } from "@utils/Utils";
import {
	profileOperatorList,
	profileQueryList,
} from "@conditionsMoodle/condition-components/ProfileComponent";

export default function SimpleConditionsSakai({ id }) {
	const { devModeStatus } = useContext(DevModeStatusContext);
	const { metaData } = useContext(MetaDataContext);
	const rfNodes = useNodes();
	const { platform } = useContext(PlatformContext);
	const conditions = getNodeById(id, rfNodes)?.data?.requisites || undefined;
	const requisites = getNodeById(id, rfNodes)?.data?.requisites || undefined;

	const dateRequisite = requisites?.find((item) => item.type === "date");
	const dateExceptionArray = requisites?.filter(
		(item) => item.type === "dateException"
	);
	const groupRequisite = requisites?.find((item) => item.type === "group");

	const qualifications = getNodeById(id, rfNodes)?.data?.g || undefined;
	const { settings } = useContext(SettingsContext);
	const parsedSettings = JSON.parse(settings);
	let { hoverConditions } = parsedSettings;

	function hasRequisiteType(type) {
		return requisites?.some((requisitesItem) => requisitesItem.type === type);
	}

	const flattenConditions = (requisites) => {
		const customSort = (a, b) => {
			const typeOrder = {
				date: 1,
				dateException: 2,
				group: 3,
			};

			return typeOrder[a.type] - typeOrder[b.type];
		};

		const sortedArray = [...requisites].sort(customSort);
	};

	const parseConditions = () => {
		let finalDOM = [
			<div>
				{JSON.stringify(getNodeById(id, rfNodes))}
				<b>Requisitos:</b>

				{hasRequisiteType("date") && (
					<div style={{ marginTop: "10px" }}>
						<b style={{ marginLeft: "24px" }}>Fecha de disponibilidad</b>
						<div style={{ marginLeft: "48px" }}>
							<div>
								La fecha de apertura establecida es:{" "}
								<b>{parseDate(dateRequisite.openingDate, true)}</b>
							</div>
							<div>
								La fecha de entrega establecida es:{" "}
								<b>{parseDate(dateRequisite.dueDate, true)}</b>
							</div>
						</div>
					</div>
				)}

				{hasRequisiteType("dateException") && (
					<div style={{ marginTop: "10px" }}>
						<b style={{ marginLeft: "24px" }}>Excepciones de fecha</b>
						{dateExceptionArray.map((date) => {
							const sakaiUsers = metaData.userMembers;
							let entityInfo = null;

							if (date.op === "user") {
								const user = sakaiUsers.find(
									(user) => user.id === date.entityId
								);

								if (user) {
									entityInfo = (
										<div>
											Usuario: <b>{user.name}</b>
										</div>
									);
								}
							} else if (date.op === "group") {
								const group = metaData.groups.find(
									(group) => group.id === date.entityId
								);
								if (group) {
									entityInfo = (
										<span>
											Grupo: <b>{group.name}</b>
										</span>
									);
								}
							}
							return (
								<div
									key={date.id}
									style={{ marginLeft: "48px", marginTop: "5px" }}
								>
									{entityInfo}
									<div>
										La fecha de apertura establecida es:{" "}
										<b>{parseDate(date.openingDate, true)}</b>
									</div>
									<div>
										La fecha de entrega establecida es:{" "}
										<b>{parseDate(date.dueDate, true)}</b>
									</div>
								</div>
							);
						})}
					</div>
				)}

				{hasRequisiteType("group") && (
					<div style={{ marginTop: "10px", marginBottom: "10px" }}>
						<b style={{ marginLeft: "24px" }}>Grupos con permisos de acceso</b>
						{groupRequisite.groupList.map((groupItem) => {
							const group = metaData.groups.find(
								(group) => group.id === groupItem.id
							);

							return (
								<li key={groupItem.id} style={{ marginLeft: "48px" }}>
									{group.name}
								</li>
							);
						})}
					</div>
				)}
			</div>,
		];
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
				? parseConditions()
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
							{JSON.stringify(getNodeById(id, rfNodes))}
							<p></p>
							Aquí se priorizará mostrar información resumida sobre las{" "}
							<b>{hoverConditions ? "condiciones" : "calificaciones"}</b> el
							bloque seleccionado.
						</div>
					);
				}
			}
		}
	}
}
