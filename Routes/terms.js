/* This code snippet is setting up a router in a Node.js application using the Express framework.
Here's a breakdown of what each part is doing: */
const router = require('express').Router();
const {
    add_terms,
    get_terms,
    get_terms_by_id,
    getTodaysRegistrations,
    search_agreement
} = require("../Controllers/Terms");

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


router.post("/addterms", upload.fields([
    { name: 'signature', maxCount: 1 },
    { name: 'photo', maxCount: 1 }
]), add_terms);


router.get("/getterms", get_terms);
router.get("/gettermsbyid/:id", get_terms_by_id);
router.post("/searchagreement", search_agreement);
router.get("/gettodaysregistrations", getTodaysRegistrations);




module.exports = router;