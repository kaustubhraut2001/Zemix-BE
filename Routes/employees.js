/* This code snippet is setting up a router in a Node.js application using the Express framework.
Here's a breakdown of what each part is doing: */
const router = require('express').Router();



const {
    add_employee,
    get_all_employee,
    delete_employee,
    edit_employee,
    getemployee_by_id,
    search_employee,
    deleteall,

} = require('../Controllers/Employees.js');


router.post('/addemployee', add_employee);
router.get('/getallemployee', get_all_employee);
router.delete('/deleteemployee/:id', delete_employee);
router.put('/editemployee/:id', edit_employee);
router.get('/getemployeebyid/:id', getemployee_by_id);
router.post('/searchemployee', search_employee);
router.delete('/deleteall', deleteall);

module.exports = router;