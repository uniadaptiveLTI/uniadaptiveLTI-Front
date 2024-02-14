import { IMetaData } from "@components/interfaces/IMetaData";
import { INode } from "@components/interfaces/INode";
import { fetchBackEnd, getLocalToken } from "middleware/common";

export interface IVersionExport {
	course: IMetaData["course_id"];
	instance: IMetaData["instance_id"];
	userId: IUserData["user_id"];
	userPerms: IUserData["userperms"];
	save: boolean;
	selection: Array<number>;
	lessonId?: number; //Sakai
	nodesToUpdate?: Array<Object>; //Sakai
	conditionList?: Array<Object>; //Sakai //TODO: DEFINE
	nodes: Array<Object>;
}

export default async function exportVersion(versionToExport: IVersionExport) {
	return fetchBackEnd(
		getLocalToken(),
		"api/lti/export_version",
		"POST",
		versionToExport
	);
}
