export default function handler(req, res) {
	const password = req.body;

	try {
		if (password == process.env.ADMIN_PASSWORD) {
			res.status(200).json({
				valid: true,
			});
		} else {
			res.status(200).json({
				valid: false,
			});
		}
	} catch (e) {
		res.status(500).json({ error: "failed to load server information" });
	}
}
