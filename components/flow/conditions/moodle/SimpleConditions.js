import { useNodes } from "reactflow";
import { getNodeById } from "@utils/Nodes";
import { DevModeStatusContext } from "@root/pages/_app";
import { useContext } from "react";

export default function SimpleConditions({ id }) {
	const { devModeStatus } = useContext(DevModeStatusContext);

	if (devModeStatus) {
		const rfNodes = useNodes();
		return JSON.stringify(getNodeById(id, rfNodes));
	} else {
		return "Información adicional";
	}
}
