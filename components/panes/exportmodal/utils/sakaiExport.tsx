import { INode } from "@components/interfaces/INode";
import { ISendNodesPayload } from "../ExportPane";
import { IMetaData } from "@components/interfaces/IMetaData";

export default function sakaiExport(
	CLEANED_NODES: Array<INode>,
	metaData: IMetaData
): ISendNodesPayload {
	//Filter out generic blocks
	const Pass1 = CLEANED_NODES.filter((node) => node.type !== "generic");

	// Remove unnecesary
}
