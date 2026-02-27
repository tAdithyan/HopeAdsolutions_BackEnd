const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
    city: {
        type: String,
        required: true
    },
    ipAddress: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
});

visitorSchema.index({ city: 1, ipAddress: 1, timestamp: -1 });

module.exports = mongoose.model('Visitor', visitorSchema);
