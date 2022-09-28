const express = require('express');
const router = express.Router();
const passport = require('passport');
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');
const users = require('../controllers/users');
const { isLoggedIn,checkReturnTo } = require('../middleware');


router.route('/register')
        .get(users.renderRegisterUser)
        .post(catchAsync(users.registerUser));

router.route('/login')
        .get(users.renderLogin)
        .post(checkReturnTo,passport.authenticate('local',{failureFlash : true, failureRedirect : '/login'}),catchAsync(users.login));

router.get('/logout',catchAsync(users.logout));

module.exports = router;