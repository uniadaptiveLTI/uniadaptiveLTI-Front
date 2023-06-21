export default function handler(req, res) {
	try {
		res.status(200).json({
			...process.resourceUsage(),
		});
	} catch (e) {
		res.status(500).json({ error: "failed to load server information" });
	}
}
