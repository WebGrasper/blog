const express = require('express');
const { signin, signup, logout, getAllUserDetails, getSingleUserDetails, getMyDetails, updatePassword, forgetPassword, resetPassword, updateMyDetails, updateMyAvatar, getsingleuser} = require("../Controllers/userControlller");
const { isAuthenticated, isAuthorizedUser } = require('../Middlewares/auth');
const multer = require('multer');

//Multer is used to handle the form-data e.g., images, files,etc.
const upload = multer();

//express router/
const router = express.Router();

router.route('/signup').post(signup);
router.route('/signin').post(signin);
router.route('/logout').put(logout);
router.route('/getMyDetails/:token').get(isAuthenticated, getMyDetails);
router.route('/updateMyDetails').put(isAuthenticated, updateMyDetails);
router.route('/updateMyAvatar').put(isAuthenticated, upload.single('avatar'), updateMyAvatar);
router.route('/getSingleUserDetails/:id').get(isAuthenticated, isAuthorizedUser,getSingleUserDetails);
router.route('/getAllUserDetails').get(isAuthenticated,isAuthorizedUser, getAllUserDetails);
router.route('/updatePassword').put(isAuthenticated, updatePassword);
router.route('/forgetPassword').post(forgetPassword);
router.route('/reset/password/:token').put(resetPassword);


module.exports = router;
