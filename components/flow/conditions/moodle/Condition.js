import React from "react";
import ConditionComponent from "./condition-components/ConditionComponent";

export const COMPLETION_QUERY_LIST = [
	{ id: 1, name: "debe estar completa" },
	{ id: 0, name: "no debe estar completa" },
	{ id: 2, name: "debe estar completa y aprobada" },
	{ id: 3, name: "debe estar completa y suspendida" },
];

export const profileOperatorList = [
	{ value: "firstname", name: "Nombre" },
	{ value: "lastname", name: "Apellido" },
	{ value: "city", name: "Ciudad" },
	{ value: "department", name: "Departamento" },
	{ value: "address", name: "Dirección" },
	{ value: "email", name: "Dirección de correo" },
	{ value: "institution", name: "Institución" },
	{ value: "idnumber", name: "Número de ID" },
	{ value: "country", name: "País" },
	{ value: "phone1", name: "Teléfono" },
	{ value: "phone2", name: "Teléfono Movil" },
];

export const profileQueryList = [
	{ value: "isequalto", name: "es igual a" },
	{ value: "contains", name: "contiene" },
	{ value: "doesnotcontain", name: "no contiene" },
	{ value: "startswith", name: "comienza con" },
	{ value: "endswith", name: "termina en" },
	{ value: "isempty", name: "está vacío" },
	{ value: "isnotempty", name: "no está vacío" },
];

function Condition({
	condition,
	conditionsList,
	upCondition,
	downCondition,
	deleteCondition,
	addCondition,
	setConditionEdit,
	swapConditionParam,
	moodleGroups,
	moodleGroupings,
	conditionsGroupOperatorList,
}) {
	return (
		<ConditionComponent
			condition={condition}
			conditionsList={conditionsList}
			setConditionEdit={setConditionEdit}
			upCondition={upCondition}
			downCondition={downCondition}
			deleteCondition={deleteCondition}
			swapConditionParam={swapConditionParam}
			addCondition={addCondition}
			completionQueryList={COMPLETION_QUERY_LIST}
			moodleGroups={moodleGroups}
			moodleGroupings={moodleGroupings}
			profileQueryList={profileQueryList}
			profileOperatorList={profileOperatorList}
			conditionsGroupOperatorList={conditionsGroupOperatorList}
		></ConditionComponent>
	);
}

export default Condition;
