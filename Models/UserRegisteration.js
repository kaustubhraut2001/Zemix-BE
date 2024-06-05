const mongoose = require("mongoose");

const userRegisterationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true

    },
    address: {
        type: String,
    },
    email: {
        type: String,
        unique: true,


    },
    plan: {
        type: String,


    },
    mobile: {
        type: String,

    },
    selectPlan: {
        type: String,
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("UserRegisteration", userRegisterationSchema);