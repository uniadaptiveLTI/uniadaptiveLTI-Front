export function getDefaultVisibility(platform) {
	switch (platform) {
		case "moodle":
			return "hidden_until_access";
		case "sakai":
			return "hidden_until_access";
		default:
			return "hidden_until_access";
	}
}

export function hasLessons(platform) {
	switch (platform) {
		case "moodle":
			return false;
		case "sakai":
			return true;
		default:
			return false;
	}
}

export function hasUnorderedResources(platform) {
	switch (platform) {
		case "moodle":
			return false;
		case "sakai":
			return true;
		default:
			return false;
	}
}

export function startingSectionNumber(platform){
	switch (platform) {
		case "moodle":
			return 0;
		case "sakai":
			return 1;
		default:
			return 1;
	}
}

export function allowsPartialExport(platform){
	switch(platform){
		case "moodle": return true;
		case "sakai": return true;
		default: return false;
	}
}