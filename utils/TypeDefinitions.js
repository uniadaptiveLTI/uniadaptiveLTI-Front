export const NodeTypes = [
	{
		id: 0,
		type: "assign",
		value: "assign",
		name: "Tarea",
		emptyName: "Tarea vacía",
		nodeType: "ElementNode",
		lms: ["moodle", "sakai"],
		gradable: [{ lms: "moodle", type: "consolidable" }],
		endHandle: ["moodle", "sakai"],
	},
	{
		id: 1,
		type: "badge",
		value: "badge",
		name: "Dar insignia",
		emptyName: "Insignia vacía",
		nodeType: "ActionNode",
		lms: ["moodle"],
		gradable: [],
	},
	{
		id: 2,
		type: "book",
		value: "book",
		name: "Libro",
		emptyName: "Libro vacío",
		nodeType: "ElementNode",
		lms: ["moodle"],
		gradable: [{ lms: "moodle", type: "simple" }],
		endHandle: ["moodle"],
	},
	{
		id: 3,
		type: "choice",
		value: "choice",
		name: "Consulta",
		emptyName: "Consulta vacía",
		nodeType: "ElementNode",
		lms: ["moodle"],
		gradable: [{ lms: "moodle", type: "choice" }],
		endHandle: ["moodle"],
	},
	{
		id: 4,
		type: "end",
		value: "end",
		name: "Salida",
		emptyName: "Salida",
		nodeType: "FinalNode",
		lms: ["lti"],
		gradable: [],
	},
	{
		id: 5,
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
		id: 6,
		type: "folder",
		value: "folder",
		name: "Carpeta",
		emptyName: "Carpeta vacía",
		nodeType: "ElementNode",
		lms: ["moodle", "sakai"],
		gradable: [{ lms: "moodle", type: "simple" }],
		endHandle: ["moodle"],
	},
	{
		id: 7,
		type: "forum",
		value: "forum",
		name: "Foro",
		emptyName: "Foro vacío",
		nodeType: "ElementNode",
		lms: ["moodle", "sakai"],
		gradable: [{ lms: "moodle", type: "consolidable" }],
		endHandle: ["moodle"],
	},
	{
		id: 8,
		type: "fragment",
		value: "fragment",
		name: "Fragmento",
		emptyName: "Fragmento",
		nodeType: "FragmentNode",
		lms: ["lti"],
		gradable: [],
	},
	{
		id: 9,
		type: "generic",
		value: "generic",
		name: "Genérico",
		emptyName: "Genérico vacío",
		nodeType: "ElementNode",
		lms: ["moodle"],
		gradable: [],
		endHandle: ["moodle"],
	},
	{
		id: 10,
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
		id: 11,
		type: "html",
		value: "html",
		name: "Página HTML",
		emptyName: "Página HTML vacía",
		nodeType: "ElementNode",
		lms: ["sakai"],
		gradable: [{ lms: "moodle", type: "simple" }],
		endHandle: [],
	},
	{
		id: 12,
		type: "label",
		value: "label",
		name: "Etiqueta",
		emptyName: "Etiqueta vacía",
		nodeType: "ElementNode",
		lms: ["moodle"],
		gradable: [{ lms: "moodle", type: "simple" }],
		endHandle: ["moodle"],
	},
	{
		id: 13,
		type: "page",
		value: "page",
		name: "Página",
		emptyName: "Página vacía",
		nodeType: "ElementNode",
		lms: ["moodle"],
		gradable: [{ lms: "moodle", type: "simple" }],
		endHandle: ["moodle"],
	},
	{
		id: 14,
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
		id: 15,
		type: "resource",
		value: "resource",
		name: "Archivo",
		emptyName: "Archivo vacío",
		nodeType: "ElementNode",
		lms: ["moodle", "sakai"],
		gradable: [{ lms: "moodle", type: "simple" }],
		endHandle: ["moodle"],
	},
	{
		id: 16,
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
		id: 17,
		type: "url",
		value: "url",
		name: "URL",
		emptyName: "URL vacía",
		nodeType: "ElementNode",
		lms: ["moodle", "sakai"],
		gradable: [{ lms: "moodle", type: "simple" }],
		endHandle: ["moodle"],
	},
	{
		id: 18,
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
	const UNSORTED_ARRAY = [];
	for (const [index, entry] of array.entries()) {
		UNSORTED_ARRAY.push({ ...entry, id: index });
	}
	const NEW_ARRAY = UNSORTED_ARRAY.sort((a, b) => a.id > b.id);
	return NEW_ARRAY;
};

/**
 * Gets an array of objects representing block flow types.
 * @returns {Array<Object>} An array of objects representing block flow types.
 */
export const getBlockFlowTypes = () => {
	return NodeTypes.flatMap((node) => {
		const TYPE = node.type;
		const NODE_TYPE = node.nodeType;
		return { [TYPE]: NODE_TYPE };
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
			const GRADABLE_OBJ = declaration.gradable.find(
				(gradable) => gradable.lms == platform
			);
			if (GRADABLE_OBJ) return true;
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
