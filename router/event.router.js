const app = require('express');
const { addComment, getAllEvent, getEvent } = require('../controller/event.controller');
const { isAuthenticatedUser } = require('../middleware/auth');
const router = app.Router()


router.get("/getAllEvent" , getAllEvent) //////// get All comment event api
router.get("/getEvent" , getEvent) //////// get All comment event api


////////////////////////////comment api
router.post("/addComment", isAuthenticatedUser ,addComment) //////// user can comment event 



module.exports  = router;