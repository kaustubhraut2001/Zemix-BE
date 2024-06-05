const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String },
    email: { type: String },
    mobile: { type: String },
    address: { type: String },
    plan: { type: String },
    selectPlan: { type: String },
    caller: { type: String },
    startDate: { type: Date }, // Store complete date and time
    endDate: { type: Date }, // Store complete date and time
    registrationDate: { type: Date }, // Store complete date and time
    status: {
        type: String,
        enum: ["Registered", "Pending", "Success", "Active", "InActive", "Cancel", "Freeze"],
        default: "Pending",
        required: true,
    },
    amount: [{ type: Number }],
    remark: { type: String },
    password: { type: String },
    passwordResetOTP: { type: String },
    totalAssignment: { type: mongoose.Schema.Types.ObjectId, ref: "TotalAssignment" },
    submittedAssignments: [{ type: mongoose.Schema.Types.ObjectId, ref: "AssignmentDetails" }],
    assignmentDetailIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "AssignmentDetails" }],
    role: { type: String, default: 'User' },
    totalAssignmentLimit: { type: Number, default: 480 },
    submittedAssignmentCount: { type: Number, default: 0 },
    pendingAssignmentCount: { type: Number, default: 480 },
    correctAssignmentCount: { type: Number },
    incorrectAssignmentCount: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);