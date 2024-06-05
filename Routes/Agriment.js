// const router = require("express").Router();

// const {
//     getaggrimentdetails
// } = require("../Controllers/Aggiriment");

// router.post("/getaggrimentdetails", getaggrimentdetails);
// module.exports = router;

const router = require("express").Router();

const {
    getaggrimentdetails,
    deleteaggriment
} = require("../Controllers/Aggiriment");

router.post("/getaggrimentdetails", getaggrimentdetails);
router.post("/deleteaggriment", deleteaggriment);
module.exports = router;