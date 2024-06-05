/* This code snippet is setting up routes for handling various user-related functionalities in a
Node.js application using Express framework. Here's a breakdown of what the code is doing: */
const router = require('express').Router();

const { getTodaysRegistrations } = require('../Controllers/Terms');
const {
    add_user,
    userlogin,
    forgot_password,
    get_all_user,
    submit_password,
    verify_otp,
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
    get_all_client,
    getallclients,
    getallinactiveusers,
    getallpending,
    getallfreez,
    getallsuccess,
    getallactive,
    getallcancel,
    getallregistered,
    gettodaysrecovery,
    deleteclient,
    sendemailforretry,
    add_terms,
    getTodayDone,
    gettoadysassignment,
    get_report_by_id,
    get_incorrect_assignments,
    getuserdetailsbymail



} = require('../Controllers/User');
const sendConfirmationEmail = require('../Utils/mail');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });


router.post('/adduser', add_user);
router.post('/login', userlogin);
router.post('/forgetpassword', forgot_password);
router.post('/submitpassword', submit_password);
router.get('/getalluser', get_all_user);
router.post('/verifyotp', verify_otp);
router.post('/getuserbystatus', getuser_by_status);
router.post('/updatestatus/:id', update_user_status);
router.post('/deleteuser', delete_user);
router.put('/edituser/:id', edit_user);
router.post('/searchusers', search_users);
router.post('/getuserbyid', getuser_by_id);
router.post('/searchuserbyname', search_user_by_name);
router.post('/userpagination', user_pagination);
router.post('/senduserinfo', sendUserInfo);
router.post('/updateenddate/:id', update_endDate);
router.post('/recoveryuser', recovery_user);
router.post('/searchuserrecovery', search_user_recovery);
router.post('/addclient', addclient);
router.get('/getallclient', getallclients);
router.get('/getallinactiveusers', getallinactiveusers);
router.get('/getallpending', getallpending);
router.get('/getallfreez', getallfreez);
router.get('/getallsuccess', getallsuccess);
router.get('/getallactive', getallactive);
router.get('/getallcancel', getallcancel);
router.get('/getallregistered', getallregistered);
router.get('/gettodaysregisterations', gettodaysrecovery);
router.post('/deleteclient', deleteclient);
router.post('/sendconfirmmail', sendemailforretry);
router.post('/add_terms', upload.fields([
    { name: 'signature', maxCount: 1 },
    { name: 'photo', maxCount: 1 }
]), add_terms);

router.get("/gettodaysregister", gettoadysassignment);
router.get(
    "/gettodaysdone", getTodayDone
);
router.post("/getreportbyid", get_report_by_id);
router.post("/getincorrectassignment", get_incorrect_assignments);
router.post("/getuserdetailsbymail", getuserdetailsbymail);


module.exports = router;