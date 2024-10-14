const app = require('express');
const router = app.Router()
const { userCreate,  login, logout, profileUpdate, userDetail, forgotPassword, resetPassword, updatePassword, verifyOtp, selfDelet, resendOTP  } = require('../controller/user.Controller');
const { isAuthenticatedUser } = require('../middleware/auth');
const { getNotification, pre_view_notification } = require('../controller/notification.controller');




///user router (crud) /////////
router.post("/userCreate", userCreate)   /////// user create
router.post("/verifyOtp", verifyOtp)   /////// verifyOtp create
router.post("/resendOTP", resendOTP)   /////// resend otp create
router.post("/selfDelet", isAuthenticatedUser,selfDelet) //// User Delete
router.post("/profileUpdate", isAuthenticatedUser, profileUpdate)  ///user update  (auth.user)
router.post("/password/update", isAuthenticatedUser, updatePassword)  ///get usre diteail (auth.user)
router.get("/userDetail", isAuthenticatedUser,  userDetail)  ///get usre diteail (auth.user)




///////////////////// tracking user ////////////

// router.get("/userTracking", isAuthenticatedUser,userTracking)  /// Tracking User pending




/////login and logout router ////////////
router.post("/login",  login) //login 
router.post("/logout", logout) //login out




//// forget password  and reset password //////
router.post("/password/forgot", forgotPassword) //forget

router.post("/password/reset/:token", resetPassword) //reset


//////////////////////notification///////////////////////
router.get("/getNotification", isAuthenticatedUser,  getNotification)
router.get("/pre_view_notification", isAuthenticatedUser,  pre_view_notification)

module.exports  = router;