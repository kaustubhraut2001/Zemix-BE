const mongoose = require('mongoose');
const agreementSchema = require("../Models/Aggrement");
const User = require("../Models/User");

const getaggrimentdetails = async(req, res) => {
    try {
        const { email } = req.body;
        //const { id } = req.body;
        // console.log(id)

        //const data = await User.findOne({ _id: id });
        //console.log(data);
        //
        //const email = data.email;
        //console.log(email);
        //661e77f6824dc31e830614ce
        const response = await agreementSchema.findOne({ email: email });
        console.log(response);
        res.status(200).json({
            message: "Aggrement Details",
            data: response,
        });
    } catch (error) {

        res.status(500).json({
            message: "Internal Server Error" + error.message,
        });

    }

}


const deleteaggriment = async(req, res) => {
    try {
        const { email } = req.body;
        console.log(req.body);
        const res = await agreementSchema.deleteOne({ email: email });
        res.status(200).json({
            message: "Aggrement Deleted",
        });

    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error" + error.message,
        });
    }
}

module.exports = {
    getaggrimentdetails,
    deleteaggriment
}