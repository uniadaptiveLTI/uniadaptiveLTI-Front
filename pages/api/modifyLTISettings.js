import fs from "fs/promises";
import path from "path";

export default function handler(req, res) {
	const object = req.body;
	const settings = object.settings;
	const password = object.password;

	try {
		if (password == process.env.ADMIN_PASSWORD) {
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
	} catch (e) {
		res.status(500).json({ error: "failed to load server information" });
	}
}
