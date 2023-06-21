export default function handler(req, res) {
	try {
		res.status(200).json({
			start_time: Date.now(),
			uptime: process.uptime(),
		});
	} catch (e) {
		res.status(500).json({ error: "failed to load server information" });
	}
}
