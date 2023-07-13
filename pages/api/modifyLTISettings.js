import fs from "fs/promises";
import path from "path";

export default function handler(req, res) {
	const object = req.body;
	const settings = object.settings;
	const password = object.password;
	const adminPassword = process.env.ADMIN_PASSWORD;

	try {
		if (adminPassword) {
			if (password == adminPassword) {
				const filePath = path.join(process.cwd(), "configuration.json");
				fs.writeFile(filePath, JSON.stringify(settings, null, "\t")).then(
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
