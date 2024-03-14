import ConditionalEdge from "@components/flow/edges/ConditionalEdge";
import ActionNode from "@components/flow/nodes/ActionNode";
import ElementNode from "@components/flow/nodes/ElementNode";
import FragmentNode from "@components/flow/nodes/FragmentNode";
import { Platforms } from "./Platform";
import { NodeTypes } from "reactflow";

export enum LTINodeTypes {
	Element = "ElementNode",
	Action = "ActionNode",
	Fragment = "FragmentNode",
}

export enum MoodleGradableTypes {
	Simple = "simple",
	Consolidable = "consolidable",
	Choice = "choice", // Just used for choice
	Normal = "normal",
	Accumulative = "accumulative",
}

type AllGradableTypes = MoodleGradableTypes;

export const RF_EDGE_TYPES = {
	conditionalEdge: ConditionalEdge,
};

interface NodeDeclaration {
	id: number;
	type: string;
	value: string;
	name: string;
	emptyName: string;
	nodeType: LTINodeTypes;
	lms: Array<Platforms>;
	gradable: Array<GradableDeclaration>;
	endHandle: Array<Platforms>; //Adds a source handle to the node.
}

interface GradableDeclaration {
	lms: Platforms;
	type: AllGradableTypes;
}

export const NodeDeclarations: Array<NodeDeclaration> = [
	{
		id: 0,
		type: "assign",
		value: "assign",
		name: "Tarea",
		emptyName: "Tarea vacía",
		nodeType: LTINodeTypes.Element,
		lms: [Platforms.Moodle, Platforms.Sakai],
		gradable: [
			{ lms: Platforms.Moodle, type: MoodleGradableTypes.Consolidable },
		],
		endHandle: [Platforms.Moodle, Platforms.Sakai],
	},
	{
		id: 1,
		type: "badge",
		value: "badge",
		name: "Dar insignia",
		emptyName: "Insignia vacía",
		nodeType: LTINodeTypes.Action,
		lms: [Platforms.Moodle],
		gradable: [],
		endHandle: [],
	},
	{
		id: 2,
		type: "book",
		value: "book",
		name: "Libro",
		emptyName: "Libro vacío",
		nodeType: LTINodeTypes.Element,
		lms: [Platforms.Moodle],
		gradable: [{ lms: Platforms.Moodle, type: MoodleGradableTypes.Simple }],
		endHandle: [Platforms.Moodle],
	},
	{
		id: 3,
		type: "choice",
		value: "choice",
		name: "Consulta",
		emptyName: "Consulta vacía",
		nodeType: LTINodeTypes.Element,
		lms: [Platforms.Moodle],
		gradable: [{ lms: Platforms.Moodle, type: MoodleGradableTypes.Choice }],
		endHandle: [Platforms.Moodle],
	},
	{
		id: 4,
		type: "exam",
		value: "exam",
		name: "Examen",
		emptyName: "Examen vacío",
		nodeType: LTINodeTypes.Element,
		lms: [Platforms.Sakai],
		gradable: [],
		endHandle: [Platforms.Sakai],
	},
	{
		id: 5,
		type: "folder",
		value: "folder",
		name: "Carpeta",
		emptyName: "Carpeta vacía",
		nodeType: LTINodeTypes.Element,
		lms: [Platforms.Moodle, Platforms.Sakai],
		gradable: [{ lms: Platforms.Moodle, type: MoodleGradableTypes.Simple }],
		endHandle: [Platforms.Moodle],
	},
	{
		id: 6,
		type: "forum",
		value: "forum",
		name: "Foro",
		emptyName: "Foro vacío",
		nodeType: LTINodeTypes.Element,
		lms: [Platforms.Moodle, Platforms.Sakai],
		gradable: [
			{ lms: Platforms.Moodle, type: MoodleGradableTypes.Consolidable },
		],
		endHandle: [Platforms.Moodle],
	},
	{
		id: 7,
		type: "fragment",
		value: "fragment",
		name: "Fragmento",
		emptyName: "Fragmento",
		nodeType: LTINodeTypes.Fragment,
		lms: [Platforms.LTI],
		gradable: [],
		endHandle: [],
	},
	{
		id: 8,
		type: "generic",
		value: "generic",
		name: "Genérico",
		emptyName: "Genérico vacío",
		nodeType: LTINodeTypes.Element,
		lms: [Platforms.Moodle],
		gradable: [{ lms: Platforms.Moodle, type: MoodleGradableTypes.Simple }],
		endHandle: [Platforms.Moodle],
	},
	{
		id: 9,
		type: "glossary",
		value: "glossary",
		name: "Glosario",
		emptyName: "Glosario vacío",
		nodeType: LTINodeTypes.Element,
		lms: [Platforms.Moodle],
		gradable: [
			{ lms: Platforms.Moodle, type: MoodleGradableTypes.Consolidable },
		],
		endHandle: [Platforms.Moodle],
	},
	{
		id: 10,
		type: "html",
		value: "html",
		name: "Página HTML",
		emptyName: "Página HTML vacía",
		nodeType: LTINodeTypes.Element,
		lms: [Platforms.Sakai],
		gradable: [],
		endHandle: [],
	},
	{
		id: 11,
		type: "label",
		value: "label",
		name: "Etiqueta",
		emptyName: "Etiqueta vacía",
		nodeType: LTINodeTypes.Element,
		lms: [Platforms.Moodle],
		gradable: [{ lms: Platforms.Moodle, type: MoodleGradableTypes.Simple }],
		endHandle: [Platforms.Moodle],
	},
	{
		id: 12,
		type: "page",
		value: "page",
		name: "Página",
		emptyName: "Página vacía",
		nodeType: LTINodeTypes.Element,
		lms: [Platforms.Moodle],
		gradable: [{ lms: Platforms.Moodle, type: MoodleGradableTypes.Simple }],
		endHandle: [Platforms.Moodle],
	},
	{
		id: 13,
		type: "quiz",
		value: "quiz",
		name: "Cuestionario",
		emptyName: "Cuestionario vacío",
		nodeType: LTINodeTypes.Element,
		lms: [Platforms.Moodle],
		gradable: [{ lms: Platforms.Moodle, type: MoodleGradableTypes.Normal }],
		endHandle: [Platforms.Moodle],
	},
	{
		id: 14,
		type: "resource",
		value: "resource",
		name: "Archivo",
		emptyName: "Archivo vacío",
		nodeType: LTINodeTypes.Element,
		lms: [Platforms.Moodle, Platforms.Sakai],
		gradable: [{ lms: Platforms.Moodle, type: MoodleGradableTypes.Simple }],
		endHandle: [Platforms.Moodle],
	},
	{
		id: 15,
		type: "text",
		value: "text",
		name: "Texto simple",
		emptyName: "Texto simple vacío",
		nodeType: LTINodeTypes.Element,
		lms: [Platforms.Sakai],
		gradable: [],
		endHandle: [],
	},
	{
		id: 16,
		type: "url",
		value: "url",
		name: "URL",
		emptyName: "URL vacía",
		nodeType: LTINodeTypes.Element,
		lms: [Platforms.Moodle, Platforms.Sakai],
		gradable: [{ lms: Platforms.Moodle, type: MoodleGradableTypes.Simple }],
		endHandle: [Platforms.Moodle],
	},
	{
		id: 17,
		type: "workshop",
		value: "workshop",
		name: "Taller",
		emptyName: "Taller vacío",
		nodeType: LTINodeTypes.Element,
		lms: [Platforms.Moodle],
		gradable: [
			{ lms: Platforms.Moodle, type: MoodleGradableTypes.Accumulative },
		],
		endHandle: [Platforms.Moodle],
	},
];

/**
 * Reorders the IDs of an array of objects.
 * @param array - The array of objects to reorder the IDs of.
 * @returns  A new array with the IDs of the objects reordered.
 */
const reorderIds = (
	array: Array<{ id: number; [key: string]: any }>
): Array<Object> => {
	const unsortedArray = array.map((entry, index) => ({ ...entry, id: index }));
	const newArray = unsortedArray.sort((a, b) => a.id - b.id);
	return newArray;
};

/**
 * Gets an object representing the block flow types.
 * @returns An object representing block flow types.
 */
export const getBlockFlowTypes = (): NodeTypes => {
	let blockFlowTypes = {};
	NodeDeclarations.forEach((node) => {
		const TYPE = node.type;
		const NODE_TYPE = node.nodeType;
		switch (NODE_TYPE) {
			case LTINodeTypes.Element:
				blockFlowTypes[TYPE] = ElementNode;
				break;
			case LTINodeTypes.Action:
				blockFlowTypes[TYPE] = ActionNode;
				break;
			case LTINodeTypes.Fragment:
				blockFlowTypes[TYPE] = FragmentNode;
				break;
			default:
				blockFlowTypes[TYPE] = NODE_TYPE; //Will not work, but ReactFlow will give a message and turn it to default.
		}
	});
	return blockFlowTypes;
};

export const RF_NODE_TYPES = getBlockFlowTypes();

/**
 * Gets an array of Moodle types, with their IDs reordered.
 * @returns An array of Moodle types, with their IDs reordered.
 */
export const getMoodleTypes = (): Array<NodeDeclaration> => {
	return reorderIds(
		NodeDeclarations.filter((type) => type.lms.includes(Platforms.Moodle))
	) as Array<NodeDeclaration>;
};

/**
 * Gets an array of Sakai types, with their IDs reordered.
 * @returns An array of Sakai types, with their IDs reordered.
 */
export const getSakaiTypes = (): Array<NodeDeclaration> => {
	return reorderIds(
		NodeDeclarations.filter((type) => type.lms.includes(Platforms.Sakai))
	) as Array<NodeDeclaration>;
};

/**
 * Gets an array of LTI types, with their IDs reordered.
 * @returns An array of LTI types, with their IDs reordered.
 */
export const getLTITypes = (): Array<NodeDeclaration> => {
	return reorderIds(
		NodeDeclarations.filter((type) => type.lms.includes(Platforms.LTI))
	) as Array<NodeDeclaration>;
};

/**
 * Gets an array of LTI types, with their IDs reordered.
 * @returns An array of ActionNodes types, with their IDs reordered.
 */
export const getActionNodeTypes = (): Array<NodeDeclaration> => {
	return reorderIds(
		NodeDeclarations.filter((type) =>
			type.nodeType.includes(LTINodeTypes.Action)
		)
	) as Array<NodeDeclaration>;
};

/**
 * Gets an array of LTI types, with their IDs reordered.
 * @returns An array of ElementNodes types, with their IDs reordered.
 */
export const getElementNodeTypes = (): Array<NodeDeclaration> => {
	return reorderIds(
		NodeDeclarations.filter((type) =>
			type.nodeType.includes(LTINodeTypes.Element)
		)
	) as Array<NodeDeclaration>;
};

/**
 * Gets an array of gradable objects for a given platform.
 * @param platform The platform to get an array of gradable objects for.
 * @returns An array of gradable objects for the given platform.
 */
export const getGradable = (platform: Platforms): Array<NodeDeclaration> => {
	return NodeDeclarations.filter((declaration) => {
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
 * @param platform The platform to get an array of gradable types for.
 * @returns An array of gradable types for the given platform.
 */
export const getGradableTypes = (platform: Platforms) => {
	return getGradable(platform).map((declaration) => declaration.type);
};
