export default function handler(req, res) {
	const PASSWORD = req.body;
	const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

	try {
		if (ADMIN_PASSWORD) {
			if (PASSWORD == ADMIN_PASSWORD) {
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
