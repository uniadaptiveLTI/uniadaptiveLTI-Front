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

export default function SimpleConditionsMoodle({ id }) {
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

	const parsedConditionsGroup = [
		{
			op: "&",
			parsed: (
				<a>
					Si se cumplen <b>TODOS</b>:
				</a>
			),
		},
		{
			op: "|",
			parsed: (
				<a>
					Si se cumple <b>UNO:</b>
				</a>
			),
		},
		{
			op: "!&",
			parsed: (
				<a>
					Si NO se cumplen <b>TODOS</b>:
				</a>
			),
		},
		{
			op: "!|",
			parsed: (
				<a>
					Si NO se cumple <b>UNO:</b>
				</a>
			),
		},
	];

	const parsedCompletionBadge = [
		{
			op: "&",
			parsed: (
				<a>
					<b>TODAS</b> las siguientes actividades han sido completadas:
				</a>
			),
		},
		{
			op: "|",
			parsed: (
				<a>
					<b>CUALQUIERA</b> de las siguientes actividades han sido completadas:
				</a>
			),
		},
	];

	const parsedBadgeListBadge = [
		{
			op: "&",
			parsed: (
				<a>
					<b>TODAS</b> las siguientes insignias tienen que haber sido ganadas:
				</a>
			),
		},
		{
			op: "|",
			parsed: (
				<a>
					<b>CUALQUIERA</b> de las siguientes insignias tienen que haber sido
					ganadas:
				</a>
			),
		},
	];

	const parsedSkillsListBadge = [
		{
			op: "&",
			parsed: (
				<a>
					<b>TODAS</b> las siguientes competencias tengan que ser completadas:
				</a>
			),
		},
		{
			op: "|",
			parsed: (
				<a>
					<b>CUALQUIERA</b> de las siguientes competencias tengan que ser
					completadas:
				</a>
			),
		},
	];

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
							{parsedConditionsGroup.find((pcg) => c.op == pcg.op).parsed}
						</p>
					);
					break;
				case "completion":
					let node = getNodeById(id, rfNodes);
					if (node.type !== "badge") {
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
					} else {
						finalDOM.push(
							<>
								<p style={prefix}>
									{parsedCompletionBadge.find((pcg) => c.op == pcg.op).parsed}
								</p>
								<p style={prefix}>
									{c.activityList.map((node) => (
										<p key={node.id}>
											{getTypeIcon(
												getNodeById(node.id, rfNodes).type,
												platform
											)}
											<span style={{ marginLeft: "4px" }}>
												<b>
													{getNodeById(node.id, rfNodes).data.label}{" "}
													{node.date && <>antes del {parseDate(node.date)}</>}
												</b>
											</span>
										</p>
									))}
								</p>
							</>
						);
					}

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
				case "role":
					finalDOM.push(
						<>
							<p style={prefix}>
								Debe ser otorgada a los usuarios con{" "}
								{c.op === "&" && <b>TODOS</b>}{" "}
								{c.op === "|" && (
									<>
										<b>CUALQUIERA</b> <a>de</a>
									</>
								)}{" "}
								los siguientes roles:
								<ul>
									{c.roleList.map((option) => {
										const roleList = metaData.role_list;

										const roleFounded = roleList.find(
											(roleMeta) => roleMeta.id === option.toString()
										);

										return <li key={roleFounded.id}>{roleFounded.name}</li>;
									})}
								</ul>
							</p>
						</>
					);
					break;
				case "courseCompletion":
					{
						(!c.op || c.op === "0" || c.op === "") &&
							!c.dateTo &&
							finalDOM.push(
								<div style={prefix}>
									Debe finalizarse el curso <strong>{metaData.name}</strong>
								</div>
							);
					}
					{
						(c.op || c.dateTo) &&
							finalDOM.push(
								<>
									<div style={prefix}>
										<a>
											Debe finalizarse el curso <b>{metaData.name}</b>
										</a>
										{c.dateTo && (
											<a>
												{" "}
												antes del <strong>{parseDate(c.dateTo)}</strong>
											</a>
										)}
										{c.op && c.op !== "0" && c.op !== "" && (
											<a>
												{" "}
												con calificación mínima de <strong>{c.op}</strong>
											</a>
										)}
									</div>
									<br></br>
								</>
							);
					}
					break;
				case "badgeList":
					finalDOM.push(
						<>
							<p style={prefix}>
								{parsedBadgeListBadge.find((pcg) => c.op == pcg.op).parsed}
							</p>
							<ul style={prefix}>
								{c.badgeList.map((badge) => {
									const metaBadgeList = metaData.badges;

									const badgeFounded = metaBadgeList.find(
										(metaBadge) => metaBadge.id === badge.toString()
									);

									return <li key={badgeFounded.id}>{badgeFounded.name}</li>;
								})}
							</ul>
						</>
					);
					break;
				case "skills":
					finalDOM.push(
						<>
							<p style={prefix}>
								{parsedSkillsListBadge.find((pcg) => c.op == pcg.op).parsed}
							</p>
							<ul style={prefix}>
								{c.skillsList.map((skill) => {
									const metaSkillsList = metaData.skills;

									const skillFounded = metaSkillsList.find(
										(metaSkill) => metaSkill.id === skill.toString()
									);

									return <li key={skillFounded.id}>{skillFounded.name}</li>;
								})}
							</ul>
						</>
					);
					break;
				default:
					break;
			}
		});

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
