const User = require("../Models/User");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
require("dotenv").config();
const sendConfirmationEmail = require("../Utils/mail.js");
const generateuserToken = require("../Utils/tokengenerator.js");
// const { generateRandomPassword } = require('../Utils/randompassword.js');
const { generateOTP, sendOTPEmail } = require("../Utils/otp.js");
const userRegisterationSchema = require("../Models/UserRegisteration");
const agreementSchema = require("../Models/Aggrement.js");
const cloudinary = require("cloudinary").v2;
const userSchema = require("../Models/User.js");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,

    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const { randomBytes } = require("crypto");

const generateRandomPassword = () => {
    const length = 8;
    const charset =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    // Check if the charset is empty
    if (charset.length === 0) {
        throw new Error("Charset must not be empty");
    }

    let password = "";

    // Generate random bytes using crypto-secure randomness
    const randomBytesBuffer = randomBytes(length);

    // Iterate over each byte and map it to the charset
    for (let i = 0; i < length; ++i) {
        const byteValue = randomBytesBuffer[i] % charset.length;
        password += charset[byteValue];
    }

    return password;
};

const add_user = async(req, res) => {
    try {
        const { name, email, mobile, address, plan, caller } = req.body;

        if (!name || !email || !mobile || !address || !plan || !caller) {
            return res.status(400).json({ message: "All fields are required." });
        }
        const existsUser = await User.findOne({
            email: email,
        });
        if (existsUser) {
            return res.status(400).json({ message: "Email Already Exists..." });
        }

        const password = generateRandomPassword();
        console.log(password, "password");
        const newUser = new User({
            name,
            email,
            mobile,
            address,
            plan,
            caller,
            password,

            status: "Registered",
            password,
            totalAssignment: 480,
            pendingAssignment: 480,
        });

        const savedUser = await newUser.save();

        await sendConfirmationEmail(email, password);
        res
            .status(201)
            .json({ message: "User added successfully", user: savedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const userlogin = async(req, res) => {
    try {
        const { email, password } = req.body;
        console.log(email);

        const user = await User.findOne({ email, password });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const currentDate = new Date();
        const userEndDate = new Date(user.endDate);
        const isWithin12Hours = new Date(
            userEndDate.getTime() + 12 * 60 * 60 * 1000
        );
        // user.endDate =  ;



        res.status(200).json({
            message: "Login success..",
            role: user.role,
            token: generateuserToken(user),
            email: user.email,
            userId: user._id,
            user: user
        });
        // if (userEndDate > currentDate) {
        //     const timeDifference = userEndDate.getTime() - currentDate.getTime();
        //     const days = Math.floor(timeDifference / (1000 * 3600 * 24));
        //     const role = user.role;
        //     const id = user._id;
        //     console.log(id);
        //     return res.status(200).json({ message: 'Login success..', role, days, token: generateuserToken(user), id, user });
        // } else {
        //     if (isWithin12Hours > currentDate) {
        //         user.status = 'Freeze';
        //         await user.save();
        //         const status = user.status;
        //         return res.status(200).json({ message: 'User status updated to Freeze', user });

        //     } else {
        //         return res.status(404).json({ message: 'QUC Failed', user });
        //     }

        // }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server error" });
    }
};

// const forgot_password = async(req, res) => {
//     const { email } = req.body;
//     try {
//         const user = await User.findOne({ email });
//         if (user) {
//             const otp = generateOTP();
//             user.passwordResetOTP = otp;
//             try {
//                 const updatedUser = await user.save();
//                 // Send OTP to user's email
//                 await sendOTPEmail(user.email, otp);
//                 res.json({ message: 'User verified successfully, and OTP sent via mail.', user_id: user._id });
//             } catch (saveError) {
//                 console.error('Error saving user:', saveError);
//                 res.status(500).json({ error: 'Error saving user data.' });
//             }
//         } else {
//             res.status(401).json({ error: 'Invalid credentials.' });
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// }
const forgot_password = async(req, res) => {
    try {
        console.log("trying");
        // i wnat new password and confirm password from user as he is login the we alredy have email
        const { newPassword, confirmPassword, userEmail } = req.body;
        // const userEmail = req.user.email;
        console.log(userEmail, "asdasd");
        if (!newPassword || !confirmPassword) {
            return res
                .status(400)
                .json({ error: "Both new password and confirm password are required" });
        }

        // Check if newPassword and confirmPassword match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ error: "Passwords do not match" });
        }

        const userdata = await User.findOne({ email: userEmail });

        if (!userdata) {
            return res.status(404).json({ error: "User not found" });
        }

        userdata.password = newPassword;
        await userdata.save();
        res
            .status(200)
            .json({ message: "Password changed successfully", user: userdata });

        // At this point, you have the newPassword and confirmPassword, and you can proceed with updating the user's password in your database
        // Implement your password update logic here

        // Respond with success message
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const verify_otp = async(req, res) => {
    const { passwordResetOTP } = req.body; // Destructure the passwordResetOTP from req.body
    try {
        const user = await User.findOne({ passwordResetOTP }); // Corrected the query
        if (user) {
            const id = user._id;
            res.status(200).json({ message: "OTP verified successfully", id });
        } else {
            res.status(401).json({ message: "Invalid OTP" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const submit_password = async(req, res) => {
    const { newPassword, confirmPassword } = req.body;
    const userId = req.params.id; // Assuming you have the correct parameter name
    console.log(userId);
    try {
        // Find the user by ID
        const user = await User.findById(userId);
        // Check if the user exists
        console.log(user);
        if (newPassword == "" || confirmPassword == "") {
            return res.status(400).json({ error: "Please Enter Any Values" });
        }
        if (user) {
            // Check if newPassword and confirmPassword match
            if (newPassword !== confirmPassword) {
                return res
                    .status(400)
                    .json({ error: "Password and Confirm Password do not match." });
            }
            // Update password and reset OTP
            user.password = newPassword;
            user.passwordResetOTP = undefined;
            // Save changes to the database
            await user.save();
            // Respond with success message
            return res.status(200).json({ message: "Password Reset Successfully." });
        } else {
            // If user is not found, respond with an error
            return res.status(401).json({ error: "Invalid credentials." });
        }
    } catch (error) {
        // Handle unexpected errors
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

const get_all_user = async(req, res) => {
    try {
        const defaultPage = 1;
        const defaultLimit = 10;
        // Get page number and limit from query parameters (use default values if not provided)
        const { page = defaultPage, limit = defaultLimit } = req.query;
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        if (
            isNaN(pageNumber) ||
            isNaN(limitNumber) ||
            pageNumber < 1 ||
            limitNumber < 1
        ) {
            return res.status(400).json({ message: "Invalid page or limit values." });
        }
        // Get the total number of users
        const totalUsers = await User.countDocuments();
        // Calculate the total number of pages
        const totalPages = Math.ceil(totalUsers / limitNumber);
        // Ensure the requested page is within bounds
        if (pageNumber > totalPages) {
            return res.status(400).json({ message: "Invalid page number." });
        }
        // Calculate the skip value based on the page number and limit
        const skip = (pageNumber - 1) * limitNumber;
        const allUser = await User.find()
            .sort({ _id: -1 })
            .skip(skip)
            .limit(limitNumber);
        res.status(200).json({
            allUser,
            currentPage: pageNumber,
            totalPages,
            totalUsers,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getuser_by_status = async(req, res) => {
    try {
        const status = req.body.status;
        const users = await User.find({ status });
        res.status(200).json({ User: users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const update_user_status = async(req, res) => {
    try {
        const userId = req.params.id; // Extract user ID from the URL parameter
        const { status } = req.body; // Destructure the 'status' from req.body
        if (!userId) {
            return res.status(400).json({ message: "User ID is required." });
        }
        const updatedUser = await User.findByIdAndUpdate(
            userId, { status }, { new: true }
        );
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found." });
        }
        res.status(200).json({ message: "Status updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const delete_user = async(req, res) => {
    try {
        // const userId = req.params.id;
        const { userId } = req.body;
        // Check if userId is provided
        if (!userId) {
            return res.status(400).json({ message: "User ID is required." });
        }
        const result = await User.deleteOne({ _id: userId });
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "User not found." });
        }
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const edit_user = async(req, res) => {
    try {
        const userId = req.params.id; // Extract user ID from the URL parameter
        const { name, email, mobile, address, plan, caller, startDate, endDate } = req.body;
        if (!userId) {
            return res.status(400).json({ message: "User ID is required." });
        }
        const updatedUser = await User.findByIdAndUpdate(
            userId, {
                name,
                email,
                mobile,
                address,
                plan,
                caller,
                startDate,
                endDate,
            }, { new: true }
        );
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found." });
        }
        res
            .status(200)
            .json({ message: "User updated successfully", user: updatedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const search_users = async(req, res) => {
    try {
        const { startDate, endDate } = req.body;
        // Check if both startDate and endDate are provided
        if (!startDate || !endDate) {
            return res.status(400).json({
                message: "Both startDate and endDate are required for searching.",
            });
        }
        // Convert startDate and endDate to Date objects
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        // Add 1 day to the endDate to include the whole day
        endDateObj.setDate(endDateObj.getDate() + 1);
        // Search for users between startDate and endDate
        const users = await User.find({
            startDate: { $gte: startDateObj, $lt: endDateObj },
        });
        res.status(200).json({ users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getuser_by_id = async(req, res) => {
    try {
        // const getid = req.params.id;
        const { userId } = req.body;
        console.log(userId);
        const user = await User.findById(userId); // Corrected this line by using findById
        res.status(200).json({ User: user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const search_user_by_name = async(req, res) => {
    try {
        const { status } = req.query;
        const { name } = req.body;
        // Check if name is provided
        if (name == "") {
            return res
                .status(404)
                .json({ message: "Please Enter Any Values for Search." });
        }
        if (!name) {
            return res
                .status(400)
                .json({ message: "Name is required for searching." });
        }
        // Search for users by name and optional status
        const query = { name: { $regex: new RegExp(name, "i") } };
        if (status) {
            query.status = status;
        }
        const users = await User.find(query);
        res.status(200).json({ users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const user_pagination = async(req, res) => {
    try {
        const { status } = req.query;
        // Set default values for page and limit
        const defaultPage = 1;
        const defaultLimit = 10;
        // Get page number and limit from query parameters (use default values if not provided)
        const { page = defaultPage, limit = defaultLimit } = req.query;
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        if (
            isNaN(pageNumber) ||
            isNaN(limitNumber) ||
            pageNumber < 1 ||
            limitNumber < 1
        ) {
            return res.status(400).json({ message: "Invalid page or limit values." });
        }
        // Build the query object with the condition based on the status parameter
        const query = status ? { status: status } : {};
        // Get the total number of users based on the condition
        const totalUsers = await User.countDocuments(query);
        // Calculate the total number of pages
        const totalPages = Math.ceil(totalUsers / limitNumber);
        // Ensure the requested page is within bounds
        if (pageNumber > totalPages) {
            return res.status(400).json({ message: "Invalid page number." });
        }
        // Calculate the skip value based on the page number and limit
        const skip = (pageNumber - 1) * limitNumber;
        // Fetch users with pagination and condition
        const users = await User.find(query)
            .sort({ _id: -1 })
            .skip(skip)
            .limit(limitNumber);
        res.status(200).json({
            users,
            currentPage: pageNumber,
            totalPages,
            totalUsers,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const sendUserInfo = async(req, res) => {
    try {
        // const { userId } = req.params;
        // console.log(userId, "userId");
        const { userID } = req.body;
        console.log(userID, "userId");
        if (typeof userID !== 'string') {
            return res.status(400).json({ error: "Invalid userID format" });
        }

        const user = await User.findById({ _id: userID });
        console.log(user, "userin the db ");
        const aggrUserId = await agreementSchema.findOne({ email: user.email });
        console.log(aggrUserId, "aggrUserId");

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        user.status = "Success";
        await user.save();
        const formatDate = (date) =>
            new Date(date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            });
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: "login",
                user: process.env.EMAIL, // Replace with your email
                pass: process.env.PASSWORD, // Replace with your email password
            },
        });

        const mailOptions = {
            from: process.env.EMAIL,
            to: user.email,
            subject: "Registration Completed",
            html: `
<div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; background-color: #f4f4f4; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
    <p style="font-size: 16px; text-align: justify;">Dear ${user.name},</p>
    <p style="font-size: 16px; text-align: justify;">Registration Details Are As Below :-</p>
    <ul style="list-style: none; padding: 0; margin: 0;">
        <li style="font-size: 16px;"><strong>Email:</strong> ${user.email}</li>
        <li style="font-size: 16px;"><strong>Phone:</strong> ${user.mobile}</li>
    </ul>
    <p style="font-size: 16px; text-align: justify;">
    <a href="https://croptonservice.netlify.app/userlogin"> Login To Your Account From Here</p></a>
    <p style="font-size: 16px;"><strong>Username:</strong> ${user.username || user.email}</p>
    <p style="font-size: 16px;"><strong>Password:</strong> ${user.password}</p>
    <p style="font-size: 16px;"><a href="https://croptonservice.netlify.app/stamppaperdonwload/${user.email}" style="color: #007bff; text-decoration: none;">


     Click Here To Download Your Legal Agreement.</a></p>
    <p style="font-size: 16px;">Email : helplinessrvice156@gmail.com</p>
    <p style="font-size: 16px;">Helpline Number : 9764841890</p>
    <p style="font-size: 16px;">Thanking You</p>
    <p style="font-size: 16px;"><strong>Cropton Services</strong></p>
</div>
`,


        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ error: "Internal Server Error" });
            }
            console.log(`Email sent: ${info.response}`);
            res.status(200).json({ message: "Email sent successfully" });
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const update_endDate = async(req, res) => {
    try {
        const userId = req.params.id;
        const amount = req.body.amount;
        if (!amount || isNaN(amount)) {
            return res.status(400).json({ error: "Invalid amount provided." });
        }
        // Find the user by ID
        const user = await User.findById(userId);
        // Check if the user exists
        if (!user) {
            c;
            return res.status(404).json({ error: "User not found." });
        }
        const today = new Date().toLocaleDateString("en-CA"); // Adjust locale if necessary
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 4);
        endDate.setUTCHours(23, 59, 59, 999);
        const endDateFormatted = endDate.toLocaleDateString("en-CA"); // Adjust locale if necessary
        // Update user fields
        user.startDate = today;
        user.endDate = endDateFormatted;
        user.status = "Success";
        user.amount.push(amount);
        // Save user
        await user.save();
        res
            .status(200)
            .json({ message: "User details updated successfully.", user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error." });
    }
};

const recovery_user = async(req, res) => {
    try {
        const defaultPage = 1;
        const defaultLimit = 10;
        // Get page number and limit from query parameters
        const { page = defaultPage, limit = defaultLimit } = req.query;
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        if (
            isNaN(pageNumber) ||
            isNaN(limitNumber) ||
            pageNumber < 1 ||
            limitNumber < 1
        ) {
            return res.status(400).json({ message: "Invalid page or limit values." });
        }
        // Get the total number of users
        const totalUsers = await User.countDocuments({
            amount: { $exists: true, $ne: [] },
        });
        // Calculate the total number of pages
        const totalPages = Math.ceil(totalUsers / limitNumber);
        // Ensure the requested page is within bounds
        if (pageNumber > totalPages) {
            return res.status(400).json({ message: "Invalid page number." });
        }
        // Calculate the skip value based on the page number and limit
        const skip = (pageNumber - 1) * limitNumber;
        const users = await User.find({
                amount: { $exists: true, $ne: [] },
            })
            .sort({ _id: -1 })
            .skip(skip)
            .limit(limitNumber);

        res.status(200).json({
            users,
            currentPage: pageNumber,
            totalPages,
            totalUsers,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error." });
    }
};

const search_user_recovery = async(req, res) => {
    try {
        const { name } = req.body;
        // Check if name is provided
        if (name == "") {
            return res
                .status(404)
                .json({ message: "Please Enter Any Values for Search." });
        }
        if (!name) {
            return res
                .status(400)
                .json({ message: "Name is required for searching." });
        }
        // Search for users by name and optional status
        const query = {
            name: { $regex: new RegExp(name, "i") },
            amount: { $exists: true, $ne: [] },
        };
        const users = await User.find(query);
        res.status(200).json({ users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const generateRandomNumber = () => {
    return Math.floor(Math.random() * (400 - 360 + 1)) + 360;
};

const addclient = async(req, res) => {
    try {
        const { name, address, email, mobile, plan, selectPlan } = req.body;
        console.log(req.body);
        if (!name) {
            return res.status(400).json({ message: "Name is required." });
        }
        if (!email) {
            return res.status(400).json({ message: "Email is required." });
        }
        const doesexits = await User.findOne({
            $or: [{ email: email }, { mobile: mobile }],
        });
        if (doesexits) {
            return res
                .status(400)
                .json({ message: "Email or Mobile already exists." });
        }
        const password = generateRandomPassword();
        console.log(password, "password");
        const newclient = new User({
            name,
            address,
            email,
            mobile,
            plan,
            password,
            selectPlan,
            registrationDate: Date.now(),
        });
        console.log(newclient, "newclient");
        const savedclient = await newclient.save();

        sendConfirmationEmail(email);

        return res.status(201).json({
            isAdded: true,
            message: "Client added successfully",
            client: savedclient,
        });
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error " + error });
    }
};

const getallclients = async(req, res) => {
    try {
        const data = await User.find().sort({ createdAt: -1 });
        res.status(200).json({
            isAvailable: true,
            data,
            messgae: "Successfully retrieved the data sorted by createdAt",
        });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getallinactiveusers = async(req, res) => {
    try {
        const users = await User.find({ status: "InActive" });
        res.status(200).json({ users, message: "All Inactive Users" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getallpending = async(req, res) => {
    try {
        const users = await User.find({ status: "Pending" }).sort({ createdAt: -1 });
        res.status(200).json({ users, message: "All Pending Users" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getallregistered = async(req, res) => {
    try {
        const users = await User.find({ status: "Registered" });
        res.status(200).json({ users, message: "All Registered Users" });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};
const getallfreez = async(req, res) => {
    try {
        const users = await User.find({ status: "Freeze" });
        res.status(200).json({ users, message: "All Freeze Users" });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getallcancel = async(req, res) => {
    try {
        const users = await User.find({ status: "Cancel" });
        res.status(200).json({ users, message: "All Cancel Users" });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getallactive = async(req, res) => {
    try {
        const users = await User.find({ status: "Active" });
        res.status(200).json({ users, message: "All Active Users" });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getallsuccess = async(req, res) => {
    try {
        const users = await User.find({ status: "Success" });
        res.status(200).json({ users, message: "All Success Users" });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const gettodaysrecovery = async(req, res) => {
    try {
        const users = await User.find({ status: "Success" });
        res.status(200).json({ users, message: "All Success Users" });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const deleteclient = async(req, res) => {
    try {
        // const { id } = req.params;
        const { id } = req.body;
        console.log(id);
        const user = await User.findByIdAndDelete(id);
        res
            .status(200)
            .json({ isDeleted: true, message: "Client deleted successfully", user });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};
const sendemailforretry = async(req, res) => {
    try {
        const { email } = req.body; // Extract email from req.body
        console.log("email is afnafbajfbakfbajkfbk", email);
        if (!email) {
            throw new Error("No recipient email provided");
        }
        await sendConfirmationEmail(email); // Pass email to sendConfirmationEmail function
        res.status(200).json({ message: "Email sent successfully" });
    } catch (error) {
        console.error("Error sending confirmation email:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const add_terms = async(req, res) => {
    try {
        const { email, startdate } = req.body;

        // Ensure that the files are present in the request
        if (!req.files || !req.files["signature"] || !req.files["photo"]) {
            return res
                .status(400)
                .json({ error: "Signature and photo files are required." });
        }

        const { signature, photo } = req.files;

        // Use findOne to get a single document
        const user = await User.findOne({ email: email });

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        const startDate = new Date(startdate);
        startDate.setUTCHours(0, 0, 0, 0); // Set time to midnight for DateOnly effect

        const endDate = new Date(startDate); // Create a new Date object from startdate
        endDate.setDate(endDate.getDate() + 4);
        endDate.setUTCHours(23, 59, 59, 999);

        user.startDate = startDate;
        user.endDate = endDate;
        user.status = "Pending";

        // Save the user with the updated status
        await user.save();

        let signatureUrl, photoUrl;

        if (signature) {
            // Upload signature file to Cloudinary
            const signatureUpload = await cloudinary.uploader.upload(
                signature[0].path
            );
            signatureUrl = signatureUpload.secure_url;
        }

        if (photo) {
            // Upload photo file to Cloudinary
            const photoUpload = await cloudinary.uploader.upload(photo[0].path);
            photoUrl = photoUpload.secure_url;
        }

        // Create a new agreement instance
        const newAgreement = new agreementSchema({
            email,
            signature: signatureUrl,
            photo: photoUrl,
            startdate: startDate,
        });

        // Save the agreement to the database
        const savedAgreement = await newAgreement.save();

        // Respond with the saved agreement
        res.status(201).json(savedAgreement);
    } catch (error) {
        console.error(error.message);
        res
            .status(500)
            .json({ error: "Internal Server Error", message: error.message });
    }
};
const gettoadysassignment = async(req, res) => {
    try {
        // Set the start and end of the day
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0); // midnight at the start of the day
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999); // one millisecond before the next day

        // Query the database for users created today
        const users = await User.find({
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        });

        // Respond with the filtered users
        res.status(200).json({ users, message: "All Users Registered Today" });
    } catch (error) {
        console.error(error); // Enhanced error handling could be useful here
        res.status(500).json({ error: "Internal Server Error" });
    }
}



const getTodayDone = async(req, res) => {
    try {
        // Set start of today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0); // set to beginning of the day

        // Set end of today
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999); // set to end of the day

        // Use startOfDay and endOfDay in your query
        const users = await User.find({
            status: "Success",
            createdAt: { $gte: startOfDay, $lte: endOfDay } // Adjusted query
        });

        // Return response with users
        res.status(200).json({ users, message: "All Success Users Today" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}


const get_report_by_id = async(req, res) => {
    try {
        //const id = req.params.id;
        const { id } = req.body;
        console.log(id);
        const user = await User.findOne({ _id: id });

        if (user) {
            if (user.submittedAssignmentCount === 480) {
                // Check if incorrectAssignment and correctAssignment are already set
                if (!user.incorrectAssignmentCount || !user.correctAssignmentCount) {
                    const correct = user.correctAssignmentCount = generateRandomNumber();
                    user.incorrectAssignmentCount = 480 - correct;
                    user.save();
                    res.status(200).json({ message: 'User Report...', user });
                } else {
                    res.status(200).json({ message: 'User Report ...', user });
                }
            } else {
                return res.status(200).json({ error: 'User did not fill all Assignments', user });
            }
        } else {
            return res.status(400).json({ message: 'User Not Found.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error...' });
    }
};


const get_incorrect_assignments = async(req, res) => {
    try {
        //const userId = req.params.id;
        const { id } = req.body;
        console.log(id, "id is ");
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User Not found' });
        }
        const incorrectAssignmentCount = user.incorrectAssignmentCount;
        if (!incorrectAssignmentCount || incorrectAssignmentCount === 0) {
            return res.status(200).json({ message: 'No incorrect assignments found for the user' });
        }
        // Retrieve random incorrect assignments from the new_Assignment schema
        const randomIncorrectAssignments = await new_Assignment.aggregate([
            { $match: { userId: id } },
            { $sample: { size: incorrectAssignmentCount } },
        ]);
        res.status(200).json({ message: 'Incorrect Assignments', incorrectAssignment: randomIncorrectAssignments });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const usersubmitassignment = async(req, res) => {
    try {
        const { userId, name, address, pinCode, jobFunctional, phone, annualRevenue, cleanCode } = req.body;

        const finduser = await User.findById(userId);

        if (!finduser) {
            return res.status(404).json({ message: "User not found" });

        }



    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });

    }

};

const getuserdetailsbymail = async(req, res) => {
    try {
        const { email } = req.body;
        console.log(email)

        const response = await User.findOne({ email })
        if (!response) {
            return res.status(404).json({ message: "User not found" })

        }
        res.status(200).json({ message: "User Details", response });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    };
}


module.exports = {
    add_user,
    userlogin,
    forgot_password,
    verify_otp,
    submit_password,
    get_all_user,
    getuser_by_status,
    update_user_status,
    delete_user,
    edit_user,
    search_users,
    getuser_by_id,
    search_user_by_name,
    user_pagination,
    sendUserInfo,
    update_endDate,
    recovery_user,
    search_user_recovery,
    addclient,
    getallclients,
    getallinactiveusers,
    getallpending,
    getallregistered,
    getallfreez,
    getallcancel,
    getallactive,
    getallsuccess,
    gettodaysrecovery,
    deleteclient,
    sendemailforretry,
    add_terms,
    gettoadysassignment,
    getTodayDone,
    get_report_by_id,
    get_incorrect_assignments,
    getuserdetailsbymail
};
