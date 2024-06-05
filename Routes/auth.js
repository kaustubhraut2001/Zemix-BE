/* This code snippet is setting up a router using Express.js framework in a Node.js application. It is
importing functions `signin`, `signup`, `adminsignin`, and `changePassword` from the
"../Controllers/Auth" file. Then, it defines routes for different authentication actions such as
signing up, signing in, admin signing in, and changing password using the imported functions.
Finally, it exports the router module to be used in the main application file. */
const router = require('express').Router();

const {


    signin,
    signup,
    adminsignin,
    changePassword,
    addadmindetails,
    forgetpasswordadmin

} = require("../Controllers/Auth");

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/adminsignin", adminsignin);
router.post("/changepassword", changePassword);
router.post("/adminaddingdetails", addadmindetails);
router.post("/adminforgetpassword", forgetpasswordadmin);



module.exports = router;