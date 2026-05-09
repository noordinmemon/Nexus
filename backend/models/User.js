const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['investor', 'entrepreneur'],
        required: true
    },
    bio: {
        type: String,
        default: ''
    },
    avatar: {
        type: String,
        default: ''
    },
    // Investor specific
    investmentRange: {
        type: String,
        default: ''
    },
    industries: {
        type: [String],
        default: []
    },
    // Entrepreneur specific
    startupName: {
        type: String,
        default: ''
    },
    startupStage: {
        type: String,
        default: ''
    },
    fundingNeeded: {
        type: String,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);