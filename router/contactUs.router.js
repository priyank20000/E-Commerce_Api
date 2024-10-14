const app = require('express');
const { createContactUs } = require('../controller/contactUs.controller');

const router = app.Router()


///////////////////// contactUs
router.post("/createContactUs", createContactUs) //////// create contact us

module.exports  = router;