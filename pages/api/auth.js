export default function handler(req, res) {
	const password = req.body;
	const adminPassword = process.env.ADMIN_PASSWORD;

	try {
		if (adminPassword) {
			if (password == adminPassword) {
				res.status(200).json({
					valid: true,
				});
			} else {
				res.status(200).json({
					valid: false,
				});
			}
		} else {
			res.status(200).json({
				valid: true,
			});
		}
	} catch (e) {
		res.status(500).json({ error: "failed to load server information" });
	}
}
