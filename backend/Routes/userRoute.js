const express = require('express');
const { signin, signup, logout, getAllUserDetails, getSingleUserDetails, getMyDetails, updatePassword, forgetPassword, resetPassword} = require("../Controllers/userControlller");
const { isAuthenticated, isAuthorizedUser } = require('../Middlewares/auth');

//express router/
const router = express.Router();

router.route('/signup').post(signup);
router.route('/signin').post(signin);
router.route('/logout').put(logout);
router.route('/getMyDetails').get(isAuthenticated, getMyDetails);
router.route('/getSingleUserDetails/:id').get(isAuthenticated, getSingleUserDetails);
router.route('/getAllUserDetails').get(isAuthenticated,isAuthorizedUser, getAllUserDetails);
router.route('/updatePassword').put(isAuthenticated, updatePassword);
router.route('/forgetPassword').post(forgetPassword);
router.route('/reset/password/:token').put(resetPassword);

module.exports = router;