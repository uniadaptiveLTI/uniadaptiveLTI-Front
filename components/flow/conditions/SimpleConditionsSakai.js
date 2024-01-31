import { useNodes, useReactFlow } from "reactflow";
import { getNodeById } from "@utils/Nodes";
import { useContext } from "react";
import { getTypeIcon } from "@utils/NodeIcons";
import { MetaDataContext, SettingsContext } from "pages/_app";
import { deduplicateById, parseDate } from "@utils/Utils";
import {
	profileOperatorList,
	profileQueryList,
} from "@components/flow/conditions/moodle/condition-components/ProfileComponent";
import { Col, Container } from "react-bootstrap";
import { parseBool } from "../../../utils/Utils";

export default function SimpleConditionsSakai({ id }) {
	const { metaData } = useContext(MetaDataContext);
	const rfNodes = useNodes();
	const REQUISITES = getNodeById(id, rfNodes)?.data?.requisites || undefined;

	const reactFlowInstance = useReactFlow();
	const NODES = reactFlowInstance.getNodes();

	const DATE_REQUISITE = REQUISITES?.find((item) => item.type === "date");
	const DATE_EXCEPTION_ARRAY = REQUISITES?.filter(
		(item) => item.type === "dateException"
	);
	const GROUP_REQUISITE = REQUISITES?.find((item) => item.type === "group");

	const GRADES = getNodeById(id, rfNodes)?.data?.gradeRequisites || undefined;
	const { settings } = useContext(SettingsContext);
	const PARSED_SETTINGS = JSON.parse(settings);
	let { hoverConditions } = PARSED_SETTINGS;

	const OPERATOR_LABEL = [
		{ op: "SMALLER_THAN", label: "<" },
		{ op: "SMALLER_THAN_OR_EQUAL_TO", label: "<=" },
		{ op: "EQUAL_TO", label: "=" },
		{ op: "GREATER_THAN_OR_EQUAL_TO", label: ">=" },
		{ op: "GREATER_THAN", label: ">" },
	];

	function hasRequisiteType(type) {
		return REQUISITES?.some((requisitesItem) => requisitesItem.type === type);
	}

	const parseConditions = () => {
		let finalDOM = [
			<div>
				{(hasRequisiteType("date") ||
					hasRequisiteType("dateException") ||
					hasRequisiteType("group")) && (
					<>
						<b>Requisitos:</b>

						{hasRequisiteType("date") && (
							<>
								<div style={{ marginTop: "10px" }}>
									<b style={{ marginLeft: "24px" }}>Fecha de disponibilidad</b>
									<div style={{ marginLeft: "48px" }}>
										<div>
											La fecha de apertura establecida es:{" "}
											<b>{parseDate(DATE_REQUISITE.openingDate, true)}</b>
										</div>
										<div>
											La fecha de entrega establecida es:{" "}
											<b>{parseDate(DATE_REQUISITE.dueDate, true)}</b>
										</div>
									</div>
								</div>
								<br></br>
							</>
						)}

						{hasRequisiteType("dateException") && (
							<div style={{ marginTop: "10px" }}>
								<b style={{ marginLeft: "24px" }}>Excepciones de fecha</b>
								{DATE_EXCEPTION_ARRAY.map((date) => {
									const SAKAI_USERS = metaData.user_members;
									let entityInfo = null;

									if (date.op === "user") {
										const USER = SAKAI_USERS.find(
											(user) => user.id === date.entityId
										);

										if (USER) {
											entityInfo = (
												<div>
													Usuario: <b>{USER.name}</b>
												</div>
											);
										}
									} else if (date.op === "group") {
										const GROUP = metaData.sakai_groups.find(
											(group) => group.id === date.entityId
										);
										if (GROUP) {
											entityInfo = (
												<span>
													Grupo: <b>{GROUP.name}</b>
												</span>
											);
										}
									}
									return (
										<>
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
											<br></br>
										</>
									);
								})}
							</div>
						)}

						{hasRequisiteType("group") && (
							<div style={{ marginTop: "10px", marginBottom: "10px" }}>
								<b style={{ marginLeft: "24px" }}>
									Grupos con permisos de acceso
								</b>
								{GROUP_REQUISITE.groupList.map((groupItem) => {
									const GROUP = metaData.sakai_groups.find(
										(group) => group.id === groupItem.id
									);

									return (
										<li key={groupItem.id} style={{ marginLeft: "48px" }}>
											{GROUP.name}
										</li>
									);
								})}
							</div>
						)}
					</>
				)}
				{!hasRequisiteType("date") &&
					!hasRequisiteType("dateException") &&
					!hasRequisiteType("group") && (
						<div>
							Aquí se priorizará mostrar la información resumida de las{" "}
							<b>condiciones</b> del bloque seleccionado. Actualmente no existe
							ninguna condición creada.
						</div>
					)}
			</div>,
		];
		return finalDOM;
	};

	const AND_LOGICAL_SET = GRADES?.subConditions?.find(
		(logicalSet) => logicalSet.operator === "AND"
	);

	const OR_LOGICAL_SET = GRADES?.subConditions?.find(
		(logicalSet) => logicalSet.operator === "OR"
	);

	const parseGrades = () => {
		let finalDOM = [
			<div>
				{((AND_LOGICAL_SET && AND_LOGICAL_SET?.subConditions.length >= 1) ||
					(OR_LOGICAL_SET && OR_LOGICAL_SET?.subConditions.length >= 1)) && (
					<>
						<b>Calificación requerida:</b>
						{AND_LOGICAL_SET && AND_LOGICAL_SET.subConditions.length >= 1 && (
							<Container>
								<div>
									Se <b>deben cumplir TODAS</b> las siguientes condiciones
								</div>
								<Container>
									<ul className="mb-0">
										{AND_LOGICAL_SET.subConditions.map((condition, index) => {
											const NODE = NODES.find(
												(node) => node.id === condition.itemId
											);

											const OPERATOR_INFO = OPERATOR_LABEL.find(
												(opInfo) => opInfo.op === condition.operator
											);

											// Render each condition here
											return (
												<li key={condition.id}>
													{NODE.data.label} {OPERATOR_INFO.label}{" "}
													{condition.argument}
												</li>
											);
										})}
									</ul>
								</Container>
							</Container>
						)}
						{OR_LOGICAL_SET &&
							AND_LOGICAL_SET &&
							OR_LOGICAL_SET.subConditions.length >= 1 &&
							AND_LOGICAL_SET.subConditions.length >= 1 && (
								<Container className="mb-2 mt-2">
									<b>Y</b>
								</Container>
							)}
						{OR_LOGICAL_SET && OR_LOGICAL_SET.subConditions.length >= 1 && (
							<Container>
								<div>
									Solo se debe <b>cumplir UNA</b> de las siguientes condiciones
								</div>
								<Container>
									<ul>
										{OR_LOGICAL_SET.subConditions.map((condition) => {
											const NODE = NODES.find(
												(node) => node.id === condition.itemId
											);

											const OPERATOR_INFO = OPERATOR_LABEL.find(
												(opInfo) => opInfo.op === condition.operator
											);

											// Render each condition here
											return (
												<li key={condition.id}>
													{NODE.data.label} {OPERATOR_INFO.label}{" "}
													{condition.argument}
												</li>
											);
										})}
									</ul>
								</Container>
							</Container>
						)}
					</>
				)}
				{((!AND_LOGICAL_SET && !OR_LOGICAL_SET) ||
					(AND_LOGICAL_SET &&
						AND_LOGICAL_SET.subConditions.length < 1 &&
						AND_LOGICAL_SET &&
						OR_LOGICAL_SET.subConditions.length < 1)) && (
					<div>
						{JSON.stringify(getNodeById(id, rfNodes))}
						Actualmente no existe ninguna condición de calificación asociada a
						este bloque, para crear una, deberás realizar una línea o conexión
						entre otro bloque y este para que se genere una condición de
						obligatoriedad de tipo calificación
					</div>
				)}
			</div>,
		];

		return finalDOM;
	};

	let finalString = undefined;
	const DEV_STRING = <div>{JSON.stringify(getNodeById(id, rfNodes))}</div>;

	if (hoverConditions && hoverConditions == true) {
		finalString = parseConditions();
		return (
			<div>
				<p>
					<b>{getNodeById(id, rfNodes).data.label}</b>
				</p>
				<hr />
				<dev>
					{parseBool(process.env.NEXT_PUBLIC_DEV_MODE)
						? [DEV_STRING, ...finalString]
						: finalString}
				</dev>
			</div>
		);
	} else {
		finalString = parseGrades();
		return (
			<div>
				<p>
					<b>{getNodeById(id, rfNodes).data.label}</b>
				</p>
				<hr />
				<dev>
					{parseBool(process.env.NEXT_PUBLIC_DEV_MODE)
						? [DEV_STRING, ...finalString]
						: finalString}
				</dev>
			</div>
		);
	}
}
