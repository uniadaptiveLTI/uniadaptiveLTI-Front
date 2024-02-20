import { fetchBackEnd, getLocalToken } from "middleware/common";

export default async function adminAuth(adminPassword: string) {
	return fetchBackEnd(getLocalToken(), "api/lti/auth", "POST", {
		password: adminPassword,
	});
}
