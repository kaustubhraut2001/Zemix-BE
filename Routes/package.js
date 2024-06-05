const router = require('express').Router();

const {
    add_package,
    getallpackage
} = require('../Controllers/Package.controller');

router.post('/addpackage', add_package);
router.get('/getallpackages', getallpackage);

module.exports = router;