import { Platforms } from "@utils/Platform";

export interface IMetaData {
	name: string;
	instance_id: number;
	lms_url: string;
	return_url: string;
	course_id: string;
	platform: Platforms.Moodle | Platforms.Sakai;
	platform_name?: string; // Optional name for the platform.
	lessons?: Array<ISakaiLesson>; // Sakai lessons
	back_url?: string; //Added by the front end in runtime
	sections: Array<ISection>;
	badges?: Array<moodleBadge>;
	grades?: Array<string>; // Moodle Qualifications
	user_members?: Array<sakaiUserMember>; // Sakai user_members
	groups?: Array<moodleGroup>; // Moodle
	sakai_groups?: Array<sakaiGroup>;
	groupings?: Array<moodleGrouping>; // Moodle
	role_list?: Array<moodleRole>; // Moodle
}

export interface ISakaiLesson {
	id: string;
	name: string;
	page_id: string;
}

export interface ISection {
	id: number;
	position: number;
	name: string;
}

interface moodleGroup {
	id: number;
	name: string;
}

interface moodleGrouping {
	id: number;
	name: string;
}

interface moodleRole {
	id: string;
	name: string;
}

interface moodleBadge {
	id: number;
	name: string;
	params: Array<moodleBadgeData>;
}

interface moodleBadgeData {
	id: number;
	criteriatype: number;
	method: number;
	descriptionformat: number;
	params: Array<moodleBadgeDataParams>;
}

interface moodleBadgeDataParams {
	id: number;
	name: string;
	value: string;
}

interface sakaiUserMember {
	id: string;
	name: string;
}

interface sakaiGroup {
	id: string;
	name: string;
}
