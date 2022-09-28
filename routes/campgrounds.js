const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const campgrounds = require('../controllers/campgrounds');
const { isLoggedIn,isAuthor,validateSchema } = require('../middleware');
const { storage } = require('../cloudinary');
const multer = require('multer');
const upload = multer({ storage });


router.get('/new',isLoggedIn,campgrounds.renderNewForm);

router.route('/')
        .get(catchAsync(campgrounds.index))
        .post(isLoggedIn,upload.array('images'),validateSchema,catchAsync(campgrounds.createNewCampgrounds));
       

router.route('/:id')
        .get(catchAsync(campgrounds.showCampgrounds))
        .put(isLoggedIn,isAuthor,upload.array('images'),validateSchema,catchAsync(campgrounds.updateCampgrounds))
        .delete(isLoggedIn,isAuthor,catchAsync(campgrounds.deleteCampgrounds));

router.get('/:id/edit',isLoggedIn,isAuthor,catchAsync(campgrounds.editCampgrounds));

module.exports = router;
