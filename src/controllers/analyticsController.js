const Visitor = require('../models/Visitor');
exports.trackVisitor = async (req, res) => {
    try {
        const { city } = req.body;
        const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        if (!city) {
            return res.status(400).json({ success: false, message: 'City is required' });
        }

        // Check if this IP has already visited today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const existingVisitor = await Visitor.findOne({
            ipAddress,
            timestamp: { $gte: startOfDay }
        });

        if (existingVisitor) {
            return res.status(200).json({
                success: true,
                message: 'Visitor already tracked today',
                data: existingVisitor
            });
        }

        const visitor = await Visitor.create({ city, ipAddress });

        res.status(201).json({
            success: true,
            data: visitor
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error tracking visitor location',
            error: error.message
        });
    }
};
