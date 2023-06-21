export const NodeTypes = [
	{
		id: 0,
		type: "start",
		value: "start",
		name: "Entrada",
		nodeType: "InitialNode",
		lms: ["lti"],
	},
	{
		id: 1,
		type: "end",
		value: "end",
		name: "Salida",
		nodeType: "FinalNode",
		lms: ["lti"],
	},
	{
		id: 2,
		type: "fragment",
		value: "fragment",
		name: "Fragmento",
		nodeType: "FragmentNode",
		lms: ["lti"],
	},
	{
		id: 3,
		type: "quiz",
		value: "quiz",
		name: "Cuestionario",
		nodeType: "ElementNode",
		lms: ["moodle"],
	},
	{
		id: 4,
		type: "assign",
		value: "assign",
		name: "Tarea",
		nodeType: "ElementNode",
		lms: ["moodle", "sakai"],
	},
	{
		id: 5,
		type: "workshop",
		value: "workshop",
		name: "Taller",
		nodeType: "ElementNode",
		lms: ["moodle"],
	},
	{
		id: 6,
		type: "choice",
		value: "choice",
		name: "Consulta",
		nodeType: "ElementNode",
		lms: ["moodle"],
	},
	{
		id: 7,
		type: "forum",
		value: "forum",
		name: "Foro",
		nodeType: "ElementNode",
		lms: ["moodle", "sakai"],
	},
	{
		id: 8,
		type: "resource",
		value: "resource",
		name: "Archivo",
		nodeType: "ElementNode",
		lms: ["moodle", "sakai"],
	},
	{
		id: 9,
		type: "folder",
		value: "folder",
		name: "Carpeta",
		nodeType: "ElementNode",
		lms: ["moodle", "sakai"],
	},
	{
		id: 10,
		type: "label",
		value: "label",
		name: "Etiqueta",
		nodeType: "ElementNode",
		lms: ["moodle"],
	},
	{
		id: 11,
		type: "page",
		value: "page",
		name: "Página",
		nodeType: "ElementNode",
		lms: ["moodle"],
	},
	{
		id: 12,
		type: "url",
		value: "url",
		name: "URL",
		nodeType: "ElementNode",
		lms: ["moodle", "sakai"],
	},
	{
		id: 13,
		type: "badge",
		value: "badge",
		name: "Dar medalla",
		nodeType: "ActionNode",
		lms: ["moodle"],
	},
	{
		id: 14,
		type: "mail",
		value: "mail",
		name: "Enviar correo",
		nodeType: "ActionNode",
		lms: ["moodle", "sakai"],
	},
	{
		id: 15,
		type: "addgroup",
		value: "addgroup",
		name: "Añadir a grupo",
		nodeType: "ActionNode",
		lms: ["moodle", "sakai"],
	},
	{
		id: 16,
		type: "remgroup",
		value: "remgroup",
		name: "Eliminar grupo",
		nodeType: "ActionNode",
		lms: ["moodle", "sakai"],
	},
	{
		id: 17,
		type: "generic",
		value: "generic",
		name: "Genérico",
		nodeType: "ElementNode",
		lms: ["moodle"],
	},
	{
		id: 18,
		type: "exam",
		value: "exam",
		name: "Exámenes",
		nodeType: "ElementNode",
		lms: ["sakai"],
	},
	/*{
		id: 19 
		type: "contents",
		value: "contents",
		name: "Contenidos",
		nodeType: "ElementNode",
		lms: ["sakai"],
	},*/
	{
		id: 19,
		type: "text",
		value: "text",
		name: "Texto simple",
		nodeType: "ElementNode",
		lms: ["sakai"],
	},
	{
		id: 20,
		type: "html",
		value: "html",
		name: "Página HTML",
		nodeType: "ElementNode",
		lms: ["sakai"],
	},
	/*{
		id: 22,
		type: "resources",
		value: "resources",
		name: "Recursos",
		nodeType: "ElementNode",
		lms: ["sakai"],
	},*/
];

const reorderIds = (array) => {
	const unsortedArray = [];
	for (const [index, entry] of array.entries()) {
		unsortedArray.push({ ...entry, id: index });
	}
	const newArray = unsortedArray.sort((a, b) => a.id > b.id);
	return newArray;
};

export const getBlockFlowTypes = () => {
	return NodeTypes.flatMap((node) => {
		const type = node.type;
		const nodeType = node.nodeType;
		return { [type]: nodeType };
	});
};

export const getMoodleTypes = () => {
	return reorderIds(NodeTypes.filter((type) => type.lms.includes("moodle")));
};

export const getSakaiTypes = () => {
	return reorderIds(NodeTypes.filter((type) => type.lms.includes("sakai")));
};

export const getLTITypes = () => {
	return reorderIds(NodeTypes.filter((type) => type.lms.includes("lti")));
};
