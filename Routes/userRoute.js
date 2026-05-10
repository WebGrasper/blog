const express = require('express');
const { signin, signup, logout, getSingleUserDetails, getMyDetails, updatePassword, forgetPassword, resetPassword, updateMyDetails, updateMyAvatar, confirmRegistration, getCommenters, getArticlesCreators } = require("../Controllers/userController");
const { isAuthenticated, isAuthorizedUser } = require('../Middlewares/auth');
const multer = require('multer');

//Multer is used to handle the form-data e.g., images, files,etc.
const upload = multer();

//express router/
const router = express.Router();

router.route('/signup').post(signup);
router.route('/confirmRegistration').post(confirmRegistration);
router.route('/signin').post(signin);
router.route('/logout').put(logout);
router.route('/getMyDetails').get(isAuthenticated, getMyDetails);
router.route('/updateMyDetails').put(isAuthenticated, updateMyDetails);
router.route('/updateMyAvatar').put(isAuthenticated, upload.single('avatar'), updateMyAvatar);
router.route('/getSingleUserDetails').get(getSingleUserDetails);
router.route('/updatePassword').put(isAuthenticated, updatePassword);
router.route('/forgetPassword').post(forgetPassword);
router.route('/reset/password').put(resetPassword);
router.route('/getCommenters').post(getCommenters);
router.route('/getArticlesCreators').post(getArticlesCreators);

module.exports = router;
