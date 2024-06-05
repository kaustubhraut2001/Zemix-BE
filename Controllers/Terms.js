const User = require("../Models/User");
const bcrypt = require("bcrypt");
const cloudinary = require("../Utils/cloudenary");
const Agreement = require("../Models/Aggrement");

const add_terms = async (req, res) => {
  try {
    const { email, startdate } = req.body;
    // console.log("req.bode", req.body);

    if (!req.files || !req.files["signature"] || !req.files["photo"]) {
      return res
        .status(400)
        .json({ error: "Signature and photo files are required." });
    }
    const { signature, photo } = req.files;
    // console.log(req.files, "body");

    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    const startDate = new Date(startdate);
    startDate.toLocaleDateString("en-CA");
    const endDate = new Date(startdate);
    endDate.setDate(endDate.getDate() + 4);
    const endDateFormatted = endDate.toLocaleDateString("en-CA");
    user.startDate = startdate;
    user.endDate = endDateFormatted;
    user.status = "Pending";

    await user.save();

    let signatureFile, photoFile;

    if (signature) {
      signatureFile = await cloudinary(signature[0].buffer);
    }
    if (photo) {
      photoFile = await cloudinary(photo[0].buffer);
    }

    const newAgreement = new Agreement({
      email,
      signature: signatureFile?.secure_url,
      photo: photoFile?.secure_url,
      startdate: startDate,
    });
    // Save the agreement to the database
    const savedAgreement = await newAgreement.save();
    console.log(savedAgreement, "saved");
    // Respond with the saved agreement
    res.status(201).json(savedAgreement);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
};

const get_terms = async (req, res) => {
  try {
    const defaultPage = 1;
    const defaultLimit = 10;
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
    // Get the total number of Agreement
    const totalUsers = await Agreement.countDocuments();
    // Calculate the total number of pages
    const totalPages = Math.ceil(totalUsers / limitNumber);
    // Ensure the requested page is within bounds
    if (pageNumber > totalPages) {
      return res.status(400).json({ message: "Invalid page number." });
    }
    const skip = (pageNumber - 1) * limitNumber;
    const allAgreements = await Agreement.find()
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limitNumber);
    if (!allAgreements.length) {
      return res.status(404).json({ message: "No agreements found" });
    }
    res.status(200).json({
      allAgreements,
      currentPage: pageNumber,
      totalPages,
      totalUsers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const get_terms_by_id = async (req, res) => {
  try {
    const id = req.params.id;
    const results = await Agreement.findById(id);
    if (!results) {
      return res.status(404).json({ message: "Not Found Any Record" });
    }
    res.status(200).json(results);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Erro!" });
  }
};
const search_agreement = async (req, res) => {
  try {
    const { name } = req.body;
    const query = { name: { $regex: new RegExp(name, "i") } };
    const results = await Agreement.find(query);
    if (name == "") {
      return res
        .status(404)
        .json({ message: "Please Enter Any Values for Search." });
    }
    if (!results.length) {
      return res
        .status(404)
        .json({ message: "No agreements found with the specified name." });
    }
    res.status(200).json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getTodaysRegistrations = async (req, res) => {
  try {
    // Query users by status
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const users = await User.aggregate([
      {
        $match: {
          status: "Registered",
          createdAt: {
            $gte: start,
            $lt: end,
          },
        },
      },
    ]);

    res.json(users.length);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

module.exports = {
  add_terms,
  get_terms,
  get_terms_by_id,
  search_agreement,
  getTodaysRegistrations,
};
