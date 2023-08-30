export const NodeTypes = [
	{
		id: 0,
		type: "addgroup",
		value: "addgroup",
		name: "Añadir a grupo",
		emptyName: "Añadir a grupo",
		nodeType: "ActionNode",
		lms: ["sakai"],
		gradable: [],
	},
	{
		id: 1,
		type: "assign",
		value: "assign",
		name: "Tarea",
		emptyName: "Tarea vacía",
		nodeType: "ElementNode",
		lms: ["moodle", "sakai"],
		gradable: [],
		endHandle: ["moodle", "sakai"],
	},
	{
		id: 2,
		type: "badge",
		value: "badge",
		name: "Dar insignia",
		emptyName: "Dar insignia",
		nodeType: "ActionNode",
		lms: ["moodle"],
		gradable: [],
	},
	{
		id: 3,
		type: "book",
		value: "book",
		name: "Libro",
		emptyName: "Libro vacío",
		nodeType: "ElementNode",
		lms: ["moodle"],
		gradable: [],
		endHandle: ["moodle"],
	},
	{
		id: 4,
		type: "choice",
		value: "choice",
		name: "Consulta",
		emptyName: "Consulta vacía",
		nodeType: "ElementNode",
		lms: ["moodle"],
		gradable: [],
		endHandle: ["moodle"],
	},
	{
		id: 5,
		type: "end",
		value: "end",
		name: "Salida",
		emptyName: "Salida",
		nodeType: "FinalNode",
		lms: ["lti"],
		gradable: [],
	},
	{
		id: 6,
		type: "exam",
		value: "exam",
		name: "Examen",
		emptyName: "Examen vacío",
		nodeType: "ElementNode",
		lms: ["sakai"],
		gradable: [],
		endHandle: ["sakai"],
	},
	{
		id: 7,
		type: "folder",
		value: "folder",
		name: "Carpeta",
		emptyName: "Carpeta vacía",
		nodeType: "ElementNode",
		lms: ["moodle", "sakai"],
		gradable: [],
		endHandle: ["moodle"],
	},
	{
		id: 8,
		type: "forum",
		value: "forum",
		name: "Foro",
		emptyName: "Foro vacío",
		nodeType: "ElementNode",
		lms: ["moodle", "sakai"],
		gradable: [{ lms: "moodle", type: "consolidable" }],
		endHandle: ["moodle", "sakai"],
	},
	{
		id: 9,
		type: "fragment",
		value: "fragment",
		name: "Fragmento",
		emptyName: "Fragmento",
		nodeType: "FragmentNode",
		lms: ["lti"],
		gradable: [],
	},
	{
		id: 10,
		type: "generic",
		value: "generic",
		name: "Genérico",
		emptyName: "Genérico vacío",
		nodeType: "ElementNode",
		lms: ["moodle", "sakai"],
		gradable: [],
		endHandle: ["moodle"],
	},
	{
		id: 11,
		type: "glossary",
		value: "glossary",
		name: "Glosario",
		emptyName: "Glosario vacío",
		nodeType: "ElementNode",
		lms: ["moodle"],
		gradable: [{ lms: "moodle", type: "consolidable" }],
		endHandle: ["moodle"],
	},
	{
		id: 12,
		type: "html",
		value: "html",
		name: "Página HTML",
		emptyName: "Página HTML vacía",
		nodeType: "ElementNode",
		lms: ["sakai"],
		gradable: [],
		endHandle: [],
	},
	{
		id: 13,
		type: "label",
		value: "label",
		name: "Etiqueta",
		emptyName: "Etiqueta vacía",
		nodeType: "ElementNode",
		lms: ["moodle"],
		gradable: [],
		endHandle: ["moodle"],
	},
	/*{
		id: 14,
		type: "lesson",
		value: "lesson",
		name: "Lección",
		nodeType: "ElementNode",
		lms: ["moodle"],
		gradable: [{ lms: "moodle", type: "normal" }],
		endHandle: ["moodle"],
	},*/
	{
		id: 15,
		type: "mail",
		value: "mail",
		name: "Enviar correo",
		emptyName: "Enviar correo",
		nodeType: "ActionNode",
		lms: ["sakai"],
		gradable: [],
	},
	{
		id: 16,
		type: "page",
		value: "page",
		name: "Página",
		emptyName: "Página vacía",
		nodeType: "ElementNode",
		lms: ["moodle"],
		gradable: [],
		endHandle: ["moodle"],
	},
	{
		id: 17,
		type: "quiz",
		value: "quiz",
		name: "Cuestionario",
		emptyName: "Cuestionario vacío",
		nodeType: "ElementNode",
		lms: ["moodle"],
		gradable: [{ lms: "moodle", type: "normal" }],
		endHandle: ["moodle"],
	},
	{
		id: 18,
		type: "remgroup",
		value: "remgroup",
		name: "Eliminar grupo",
		emptyName: "Eliminar grupo",
		nodeType: "ActionNode",
		lms: ["sakai"],
		gradable: [],
	},
	{
		id: 19,
		type: "resource",
		value: "resource",
		name: "Archivo",
		emptyName: "Archivo vacío",
		nodeType: "ElementNode",
		lms: ["moodle", "sakai"],
		gradable: [],
		endHandle: ["moodle"],
	},
	{
		id: 20,
		type: "start",
		value: "start",
		name: "Entrada",
		emptyName: "Entrada",
		nodeType: "InitialNode",
		lms: ["lti"],
		gradable: [],
	},
	{
		id: 21,
		type: "text",
		value: "text",
		name: "Texto simple",
		emptyName: "Texto simple vacío",
		nodeType: "ElementNode",
		lms: ["sakai"],
		gradable: [],
		endHandle: [],
	},
	{
		id: 22,
		type: "url",
		value: "url",
		name: "URL",
		emptyName: "URL vacía",
		nodeType: "ElementNode",
		lms: ["moodle", "sakai"],
		gradable: [],
		endHandle: ["moodle"],
	},
	{
		id: 23,
		type: "wiki",
		value: "wiki",
		name: "Wiki",
		emptyName: "Wiki vacío",
		nodeType: "ElementNode",
		lms: ["sakai"],
		gradable: [],
		endHandle: [],
	},
	{
		id: 24,
		type: "workshop",
		value: "workshop",
		name: "Taller",
		emptyName: "Taller vacío",
		nodeType: "ElementNode",
		lms: ["moodle"],
		gradable: [{ lms: "moodle", type: "accumulative" }],
		endHandle: ["moodle"],
	},
];

/**
 * Reorders the IDs of an array of objects.
 * @param {Array<Object>} array - The array of objects to reorder the IDs of.
 * @returns {Array<Object>} A new array with the IDs of the objects reordered.
 */
const reorderIds = (array) => {
	const unsortedArray = [];
	for (const [index, entry] of array.entries()) {
		unsortedArray.push({ ...entry, id: index });
	}
	const newArray = unsortedArray.sort((a, b) => a.id > b.id);
	return newArray;
};

/**
 * Gets an array of objects representing block flow types.
 * @returns {Array<Object>} An array of objects representing block flow types.
 */
export const getBlockFlowTypes = () => {
	return NodeTypes.flatMap((node) => {
		const type = node.type;
		const nodeType = node.nodeType;
		return { [type]: nodeType };
	});
};

/**
 * Gets an array of Moodle types, with their IDs reordered.
 * @returns {Array<Object>} An array of Moodle types, with their IDs reordered.
 */
export const getMoodleTypes = () => {
	return reorderIds(NodeTypes.filter((type) => type.lms.includes("moodle")));
};

/**
 * Gets an array of Sakai types, with their IDs reordered.
 * @returns {Array<Object>} An array of Sakai types, with their IDs reordered.
 */
export const getSakaiTypes = () => {
	return reorderIds(NodeTypes.filter((type) => type.lms.includes("sakai")));
};

/**
 * Gets an array of LTI types, with their IDs reordered.
 * @returns {Array<Object>} An array of LTI types, with their IDs reordered.
 */
export const getLTITypes = () => {
	return reorderIds(NodeTypes.filter((type) => type.lms.includes("lti")));
};

/**
 * Gets an array of gradable objects for a given platform.
 * @param {string} platform - The platform to get an array of gradable objects for.
 * @returns {Array<Object>} An array of gradable objects for the given platform.
 */
export const getGradable = (platform) => {
	return NodeTypes.filter((declaration) => {
		if (declaration.gradable.length > 0) {
			const gradableObj = declaration.gradable.find(
				(gradable) => gradable.lms == platform
			);
			if (gradableObj) return true;
			return false;
		}
	});
};

/**
 * Gets an array of gradable types for a given platform.
 * @param {string} platform - The platform to get an array of gradable types for.
 * @returns {Array<string>} An array of gradable types for the given platform.
 */
export const getGradableTypes = (platform) => {
	return getGradable(platform).map((declaration) => declaration.type);
};
