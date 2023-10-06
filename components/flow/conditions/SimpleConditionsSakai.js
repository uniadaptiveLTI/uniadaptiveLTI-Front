import { useNodes, useReactFlow } from "reactflow";
import { getNodeById } from "@utils/Nodes";
import { DevModeStatusContext } from "/pages/_app";
import { useContext } from "react";
import { getTypeIcon } from "@utils/NodeIcons";
import { MetaDataContext, PlatformContext, SettingsContext } from "pages/_app";
import { deduplicateById, parseDate } from "@utils/Utils";
import {
	profileOperatorList,
	profileQueryList,
} from "@components/flow/conditions/moodle/condition-components/ProfileComponent";
import { Col, Container } from "react-bootstrap";

export default function SimpleConditionsSakai({ id }) {
	const { devModeStatus } = useContext(DevModeStatusContext);
	const { metaData } = useContext(MetaDataContext);
	const rfNodes = useNodes();
	const { platform } = useContext(PlatformContext);
	const conditions = getNodeById(id, rfNodes)?.data?.requisites || undefined;
	const requisites = getNodeById(id, rfNodes)?.data?.requisites || undefined;

	const reactFlowInstance = useReactFlow();
	const nodes = reactFlowInstance.getNodes();

	const dateRequisite = requisites?.find((item) => item.type === "date");
	const dateExceptionArray = requisites?.filter(
		(item) => item.type === "dateException"
	);
	const groupRequisite = requisites?.find((item) => item.type === "group");

	const grades = getNodeById(id, rfNodes)?.data?.gradeRequisites || undefined;
	const { settings } = useContext(SettingsContext);
	const parsedSettings = JSON.parse(settings);
	let { hoverConditions } = parsedSettings;

	const operatorLabel = [
		{ op: "SMALLER_THAN", label: "<" },
		{ op: "SMALLER_THAN_OR_EQUAL_TO", label: "<=" },
		{ op: "EQUAL_TO", label: "=" },
		{ op: "GREATER_THAN_OR_EQUAL_TO", label: ">=" },
		{ op: "GREATER_THAN", label: ">" },
	];

	function hasRequisiteType(type) {
		return requisites?.some((requisitesItem) => requisitesItem.type === type);
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
											<b>{parseDate(dateRequisite.openingDate, true)}</b>
										</div>
										<div>
											La fecha de entrega establecida es:{" "}
											<b>{parseDate(dateRequisite.dueDate, true)}</b>
										</div>
									</div>
								</div>
								<br></br>
							</>
						)}

						{hasRequisiteType("dateException") && (
							<div style={{ marginTop: "10px" }}>
								<b style={{ marginLeft: "24px" }}>Excepciones de fecha</b>
								{dateExceptionArray.map((date) => {
									const sakaiUsers = metaData.user_members;
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
										const group = metaData.sakai_groups.find(
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
								{groupRequisite.groupList.map((groupItem) => {
									const group = metaData.sakai_groups.find(
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

	const andLogicalSet = grades?.subConditions?.find(
		(logicalSet) => logicalSet.operator === "AND"
	);

	const orLogicalSet = grades?.subConditions?.find(
		(logicalSet) => logicalSet.operator === "OR"
	);

	const parseGrades = () => {
		let finalDOM = [
			<div>
				{((andLogicalSet && andLogicalSet?.subConditions.length >= 1) ||
					(orLogicalSet && orLogicalSet?.subConditions.length >= 1)) && (
					<>
						<b>Calificación requerida:</b>
						{andLogicalSet && andLogicalSet.subConditions.length >= 1 && (
							<Container>
								<div>
									Se <b>deben cumplir TODAS</b> las siguientes condiciones
								</div>
								<Container>
									<ul className="mb-0">
										{andLogicalSet.subConditions.map((condition, index) => {
											const node = nodes.find(
												(node) => node.id === condition.itemId
											);

											const operatorInfo = operatorLabel.find(
												(opInfo) => opInfo.op === condition.operator
											);

											// Render each condition here
											return (
												<li key={condition.id}>
													{node.data.label} {operatorInfo.label}{" "}
													{condition.argument}
												</li>
											);
										})}
									</ul>
								</Container>
							</Container>
						)}
						{orLogicalSet &&
							andLogicalSet &&
							orLogicalSet.subConditions.length >= 1 &&
							andLogicalSet.subConditions.length >= 1 && (
								<Container className="mb-2 mt-2">
									<b>Y</b>
								</Container>
							)}
						{orLogicalSet && orLogicalSet.subConditions.length >= 1 && (
							<Container>
								<div>
									Solo se debe <b>cumplir UNA</b> de las siguientes condiciones
								</div>
								<Container>
									<ul>
										{orLogicalSet.subConditions.map((condition) => {
											const node = nodes.find(
												(node) => node.id === condition.itemId
											);

											const operatorInfo = operatorLabel.find(
												(opInfo) => opInfo.op === condition.operator
											);

											// Render each condition here
											return (
												<li key={condition.id}>
													{node.data.label} {operatorInfo.label}{" "}
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
				{((!andLogicalSet && !orLogicalSet) ||
					(andLogicalSet &&
						andLogicalSet.subConditions.length < 1 &&
						andLogicalSet &&
						orLogicalSet.subConditions.length < 1)) && (
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
	const devString = <div>{JSON.stringify(getNodeById(id, rfNodes))}</div>;

	if (hoverConditions && hoverConditions == true) {
		finalString = parseConditions();
		return (
			<div>
				<p>
					<b>{getNodeById(id, rfNodes).data.label}</b>
				</p>
				<hr />
				<dev>{devModeStatus ? [devString, ...finalString] : finalString}</dev>
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
				<dev>{devModeStatus ? [devString, ...finalString] : finalString}</dev>
			</div>
		);
	}
}
