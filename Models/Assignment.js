const mongoose = require('mongoose');

const new_assignmentSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    address: {
        type: String,
    },
    pinCode: {
        type: Number,
    },
    jobFunctional: {
        type: String,
    },
    phone: {
        type: String,
    },
    annualRevenue: {
        type: String,
    },
    cleanCode: {
        type: String,
    },
    reference_assignment: {
        type: String,
    },
    userId: {
        type: String,
    },
    status: { type: String },
}, {
    timestamps: true
});

module.exports = mongoose.model('new_Assignment', new_assignmentSchema);