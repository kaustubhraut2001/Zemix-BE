const Assignment = require("../Models/Assignment");
const User = require("../Models/User");
const new_assignmentSchema = require("../Models/Assignment");


const add_assignment = async(req, res) => {
    try {
        // const userId = req.params.id;
        const { userId, name, address, pinCode, jobFunctional, phone, annualRevenue, cleanCode } = req.body;

        // Check if all required fields are provided
        // if (!name || !address || !pinCode || !jobFunctional || !phone || !annualRevenue) {
        //     return res.status(400).json({ message: "All fields are required." });
        // }

        // Check if the name is unique (optional)
        // const existingAssignment = await new_assignmentSchema.findOne({ name });
        // if (existingAssignment) {
        //     return res.status(400).json({ message: "Name already exists for an assignment." });
        // }
        // const globalId = getGlobalAssignmentDetailId();
        // Use the globalAssignmentDetailId directly
        // const newAssignment = new new_assignmentSchema({
        //  name,
        // address,
        // pinCode,
        // jobFunctional,
        //  phone,
        //  annualRevenue,
        // cleanCode,
        // reference_assignment: globalId,
        //  userId: userId,
        //  });

        // Save the new assignment
        //const savedAssignment = await newAssignment.save();

        // Update total assignments (if needed)
        console.log(userId, "userid");
        const user = await User.findById(userId);
        console.log(user, "assignment")
        if (user) {
            if (user.submittedAssignmentCount < 480) {
                user.submittedAssignmentCount += 1;
            }
            user.pendingAssignmentCount -= 1;
            await user.save();
        }

        res.status(201).json({
            message: "Assignment added successfully",

        });
    } catch (error) {
        console.error("Error adding assignment:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const get_assignments = async(req, res) => {
    try {

        const { userId } = req.body;
        console.log(userId, "userId");
        const assignments = await new_assignmentSchema.find({ userId: userId });
        // const assignments = await new_assignmentSchema.find();
        console.log(assignments, "assignmen");
        res.status(200).json({ assignments: assignments });
    } catch (error) {
        console.error("Error fetching assignments:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const get_totalAssignment = async(req, res) => {
    try {
        const userId = req.params.id;
        const totalAssignment = await User.findById(userId);
        if (totalAssignment) {
            res.status(200).json({
                total: totalAssignment.totalAssingment,
                submitted: totalAssignment.submitdAssingment,
                pending: totalAssignment.pendingAssingment,
            });
        } else {
            res.status(404).json({ message: "Total assignment statistics not found." });
        }
    } catch (error) {
        console.error("Error fetching total assignment statistics:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
const get_assignment_details = async(req, res) => {
    console.log("inside get assignments");
    try {
        // Find the user by email
        const { email } = req.body;
        const user = await User.findOne({ email });
        console.log(user);
        // Check if the user exists
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        // Check if assignmentDetailIds is available
        const assignmentDetailIds = user.assignmentDetailIds || [];
        const availableAssignmentDetails = await new_assignmentSchema.find({
            _id: {
                $nin: assignmentDetailIds,
            },
        });
        if (availableAssignmentDetails.length > 0) {
            // Choose a random assignment detail
            const randomIndex = Math.floor(Math.random() * availableAssignmentDetails.length);
            const randomAssignmentDetail = availableAssignmentDetails[randomIndex];
            // Set the global assignment detail ID
            setGlobalAssignmentDetailId(randomAssignmentDetail._id);
            // Send the response with the assignment detail
            return res.status(200).json({
                message: "Assignment Detail retrieved successfully",
                assignmentDetail: randomAssignmentDetail,
            });
        } else {
            return res.status(404).json({ message: "No available assignment details." });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error", msg: error.message });
    }
};
const refresh_get_assignment_details = async(req, res) => {
    try {
        await User.updateOne({ email: req.body.email }, {
            $push: { assignmentDetailIds: req.params.assignmentId },
        });

        return res.status(200).send({
            message: "Assignment Detail refreshed",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "Internal Server refreshed Error" });
    }
};

const addmultipleasignment = async(req, res) => {
    try {
        // const { userId } = req.params;
        // const { userId, name, address, pinCode, jobFunctional, phone, annualRevenue, cleanCode } = req.body;

        // Assuming req.body contains an array of customer assignments
        const assignments = req.body;

        // Loop through each assignment and insert it into the database
        for (let i = 0; i < assignments.length; i++) {
            const assignmentData = {
                userId: assignments[i].userId,
                name: assignments[i].name,
                address: assignments[i].address,
                pinCode: assignments[i].pinCode,
                jobFunctional: assignments[i].jobFunctional,
                phone: assignments[i].phone,
                annualRevenue: assignments[i].annualRevenue,
                cleanCode: assignments[i].cleanCode
            };
            const newAssignment = new new_assignmentSchema(assignmentData); // Assuming CustomerAssignment is your Mongoose model
            await newAssignment.save();
        }

        res.status(201).json({ message: 'Assignments created successfully' });



    } catch (error) {

        res.status(500).json({ message: "Internal Server Error", Error: error.message });

    }
};


const getallassignments = async(req, res) => {
    try {
        const assignments = await new_assignmentSchema.find();
        res.status(200).json({ assignments: assignments });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};





module.exports = {
    add_assignment,
    get_assignments,
    get_totalAssignment,
    get_assignment_details,
    refresh_get_assignment_details,
    addmultipleasignment,
    getallassignments

};
