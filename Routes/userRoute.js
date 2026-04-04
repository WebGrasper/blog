const express = require('express');
const {
  signin, signup, logout, getAllUserDetails, getSingleUserDetails,
  getMyDetails, updatePassword, forgetPassword, resetPassword,
  updateMyDetails, updateMyAvatar, getCommenters, getArticlesCreators,
  confirmRegistration,
} = require('../Controllers/userControlller');
const { isAuthenticated, isAuthorizedUser } = require('../Middlewares/auth');
const {
  validateSignup, validateSignin, validateUpdatePassword,
  validateForgetPassword, validateResetPassword,
} = require('../Middlewares/validators');
const multer = require('multer');

const upload = multer({ limits: { fileSize: 2 * 1024 * 1024 } });
const router = express.Router();

router.post('/signup', validateSignup, signup);
router.post('/confirmRegistration', confirmRegistration);
router.post('/signin', validateSignin, signin);
router.put('/logout', logout);
router.get('/getMyDetails', isAuthenticated, getMyDetails);
router.put('/updateMyDetails', isAuthenticated, updateMyDetails);
router.put('/updateMyAvatar', isAuthenticated, upload.single('avatar'), updateMyAvatar);
router.get('/getSingleUserDetails', getSingleUserDetails);
router.get('/getAllUserDetails', isAuthenticated, isAuthorizedUser, getAllUserDetails);
router.put('/updatePassword', isAuthenticated, validateUpdatePassword, updatePassword);
router.post('/forgetPassword', validateForgetPassword, forgetPassword);
router.put('/reset/password', validateResetPassword, resetPassword);
router.post('/getCommenters', getCommenters);
router.post('/getArticlesCreators', getArticlesCreators);

module.exports = router;
