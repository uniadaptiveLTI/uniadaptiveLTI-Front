export const NodeTypes = [
	{
		id: 0,
		type: "addgroup",
		value: "addgroup",
		name: "Añadir a grupo",
		nodeType: "ActionNode",
		lms: ["moodle", "sakai"],
	},
	{
		id: 1,
		type: "assign",
		value: "assign",
		name: "Tarea",
		nodeType: "ElementNode",
		lms: ["moodle", "sakai"],
	},
	{
		id: 2,
		type: "badge",
		value: "badge",
		name: "Dar insignia",
		nodeType: "ActionNode",
		lms: ["moodle"],
	},
	{
		id: 3,
		type: "book",
		value: "book",
		name: "Libro",
		nodeType: "ElementNode",
		lms: ["moodle"],
	},
	{
		id: 4,
		type: "choice",
		value: "choice",
		name: "Consulta",
		nodeType: "ElementNode",
		lms: ["moodle"],
	},
	{
		id: 5,
		type: "end",
		value: "end",
		name: "Salida",
		nodeType: "FinalNode",
		lms: ["lti"],
	},
	{
		id: 6,
		type: "exam",
		value: "exam",
		name: "Examen",
		nodeType: "ElementNode",
		lms: ["sakai"],
	},
	{
		id: 7,
		type: "folder",
		value: "folder",
		name: "Carpeta",
		nodeType: "ElementNode",
		lms: ["moodle", "sakai"],
	},
	{
		id: 8,
		type: "forum",
		value: "forum",
		name: "Foro",
		nodeType: "ElementNode",
		lms: ["moodle", "sakai"],
	},
	{
		id: 9,
		type: "fragment",
		value: "fragment",
		name: "Fragmento",
		nodeType: "FragmentNode",
		lms: ["lti"],
	},
	{
		id: 10,
		type: "generic",
		value: "generic",
		name: "Genérico",
		nodeType: "ElementNode",
		lms: ["moodle"],
	},
	{
		id: 11,
		type: "glossary",
		value: "glossary",
		name: "Glosario",
		nodeType: "ElementNode",
		lms: ["moodle"],
	},
	{
		id: 12,
		type: "html",
		value: "html",
		name: "Página HTML",
		nodeType: "ElementNode",
		lms: ["sakai"],
	},
	{
		id: 13,
		type: "label",
		value: "label",
		name: "Etiqueta",
		nodeType: "ElementNode",
		lms: ["moodle"],
	},
	{
		id: 14,
		type: "lesson",
		value: "lesson",
		name: "Lección",
		nodeType: "ElementNode",
		lms: ["moodle"],
	},
	{
		id: 15,
		type: "mail",
		value: "mail",
		name: "Enviar correo",
		nodeType: "ActionNode",
		lms: ["moodle", "sakai"],
	},
	{
		id: 16,
		type: "page",
		value: "page",
		name: "Página",
		nodeType: "ElementNode",
		lms: ["moodle"],
	},
	{
		id: 17,
		type: "quiz",
		value: "quiz",
		name: "Cuestionario",
		nodeType: "ElementNode",
		lms: ["moodle"],
	},
	{
		id: 18,
		type: "remgroup",
		value: "remgroup",
		name: "Eliminar grupo",
		nodeType: "ActionNode",
		lms: ["moodle", "sakai"],
	},
	{
		id: 19,
		type: "resource",
		value: "resource",
		name: "Archivo",
		nodeType: "ElementNode",
		lms: ["moodle", "sakai"],
	},
	{
		id: 20,
		type: "start",
		value: "start",
		name: "Entrada",
		nodeType: "InitialNode",
		lms: ["lti"],
	},
	{
		id: 21,
		type: "text",
		value: "text",
		name: "Texto simple",
		nodeType: "ElementNode",
		lms: ["sakai"],
	},
	{
		id: 22,
		type: "url",
		value: "url",
		name: "URL",
		nodeType: "ElementNode",
		lms: ["moodle", "sakai"],
	},
	{
		id: 23,
		type: "wiki",
		value: "wiki",
		name: "Wiki",
		nodeType: "ElementNode",
		lms: ["sakai"],
	},
	{
		id: 24,
		type: "workshop",
		value: "workshop",
		name: "Taller",
		nodeType: "ElementNode",
		lms: ["moodle"],
	},
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
