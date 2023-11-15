import fs from "fs/promises";
import path from "path";

export default function handler(req, res) {
	const OBJECT = req.body;
	const SETTINGS = OBJECT.settings;
	const PASSWORD = OBJECT.password;
	const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

	try {
		if (ADMIN_PASSWORD) {
			if (PASSWORD == ADMIN_PASSWORD) {
				const FILE_PATH = path.join(process.cwd(), "configuration.json");
				fs.writeFile(FILE_PATH, JSON.stringify(SETTINGS, null, "\t")).then(
					res.status(200).json({
						ok: true,
					})
				);
			} else {
				res.status(200).json({
					ok: false,
				});
			}
		} else {
			res.status(200).json({
				ok: true,
			});
		}
	} catch (e) {
		res.status(500).json({ error: "failed to load server information" });
	}
}
