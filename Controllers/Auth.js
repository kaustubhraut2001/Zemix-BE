const User = require("../Models/User");
const Admin = require("../Models/Admin");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendConfirmationEmail } = require('../Utils/mail');
const UserLogin = require("../Models/UserLogin");
const adminloginSchema = require("../Models/Admin");



const signup = async(req, res) => {
    console.log(req.body);
    try {
        const { firstname, lastname, email, password, confirm_password } = req.body;

        if (password !== confirm_password) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = new UserLogin({
            firstname,
            lastname,
            email,
            password: hashedPassword,
        });
        const savedUser = await newUser.save();
        // Call the function to send confirmation email
        await sendConfirmationEmail(savedUser, password);
        res.status(201).json({ message: 'User added successfully', user: savedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

function generateAuthToken(user) {
    const token = jwt.sign({ _id: user._id, email: user.email, role: user.role }, 'yourSecretKey', { expiresIn: '1h' });
    return token; //Return Token
}

const addadmindetails = async(req, res) => {
    try {
        const { firstname, lastname, email, password } = req.body;

        // if (password !== confirm_password) {
        //     return res.status(400).json({ error: 'Passwords do not match' });
        // }
        console.log(req.body);
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        console.log(hashedPassword, "hashedPassword");
        const newAdmin = new adminloginSchema({
            firstname,
            lastname,
            email,
            password: hashedPassword,
            role: "admin"
        });
        const savedAdmin = await newAdmin.save();
        res.status(201).json({ message: 'Admin added successfully', admin: savedAdmin });


    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });

    }
}


const signin = async(req, res) => {
    try {
        const { email, password } = req.body;
        // Check if email and password are provided

        console.log(req.body);
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }
        // Find the user by email
        const user = await UserLogin.findOne({ email });
        console.log(user);
        // Check if the user exists
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }
        // Check if the password is correct
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }
        // Generate and send the authentication token
        res.status(200).json({ message: 'Signin successful.', token: generateAuthToken(user), isStamp: user.isStamp });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const adminsignin = async(req, res) => {
    try {
        const { username, password } = req.body;
        // Check if email and password are provided
        console.log(req.body)
        if (!username || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }
        // Find the user by email
        const user = await adminloginSchema.findOne({
            email: username
        });
        console.log(user, "asdasd");
        const role = user.role;
        // Check if the user exists
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }
        // Generate and send the authentication token
        res.status(200).json({ message: 'Signin successful.', role, token: generateadminToken(user) });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


function generateadminToken(user) {
    const token = jwt.sign({ _id: user._id, email: user.email }, 'yourSecretKey', { expiresIn: '1h' });
    return token; //Return Token
}

//change password
const changePassword = async(req, res) => {
    try {
        // get new Password from body
        const { newPassword } = req.body;

        // find Admin by role
        const admin = await AdminLogin.findOne({ role: "Admin" });
        // console.log(admin, "admin",newPassword);
        // Set new password
        admin.password = newPassword;
        await admin.save();

        res.status(200).json({ message: "Password Successfully Changed" });

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Error changing Password" });
    }
}


const forgetpasswordadmin = async(req, res) => {
    try {
        const {
            userEmail,
            newPassword,
            confirmPassword
        } = req.body;
        console.log(req.body);
        const admin = await adminloginSchema.findOne({ email: userEmail });
        console.log(admin);
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }
        admin.password = newPassword;
        await admin.save();
        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error resetting password" });
    }
}

module.exports = {
    signup,
    signin,
    adminsignin,
    changePassword,
    addadmindetails,
    forgetpasswordadmin
};