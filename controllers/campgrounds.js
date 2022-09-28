//const mongoose = require('mongoose');
const Campground = require('../models/campground');
const {cloudinary} = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.renderNewForm = (req,res)=>{
    res.render('campgrounds/new');
};

module.exports.index = async (req,res,next)=>{
    const campgrounds = await Campground.find({});
    if(!campgrounds)
    {
       req.flash('error','Campground not found') ;
    }
    res.render('campgrounds/index',{campgrounds});
};

module.exports.updateCampgrounds = async (req,res,next)=>{
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground});
    const imgs = req.files.map(f => ({ url : f.path, filename : f.filename}));
    campground.images.push(...imgs);
    await campground.save();
    console.log(req.body);
    if(req.body.deleteImages)
    {
       for(let filename of req.body.deleteImages)
        {
            await cloudinary.uploader.destroy(filename);
        }
        //console.log({$pull : {images : {filename : {$in : req.body.deleteImages} } } });
        await campground.updateOne({$pull : {images : {filename : {$in : req.body.deleteImages} } } });
       // console.log(campground);
    }
    
    req.flash('success','succesfully updated');
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampgrounds = async(req,res,next)=>{
    
    const campground = await Campground.findById(req.params.id).populate({path :'reviews',populate : { path : 'author'}}).populate('author');
    try{
        res.render('campgrounds/show',{campground});
    }
    catch(e)
    {
        req.flash('error',e.message);
    }
   
};

module.exports.createNewCampgrounds = async(req,res,next)=>{
    const geodata = await geocoder.forwardGeocode({
        query : req.body.campground.location,
        limit : 1
    }).send();
    const campground = new Campground(req.body.campground);
    campground.geometry = geodata.body.features[0].geometry;
    //console.log(campground.geometry);    
    campground.author = req.user._id;
    campground.images = req.files.map(f => ({ url : f.path, filename : f.filename}));
    await campground.save();
    console.log(campground);
    req.flash('success','succesfully created');
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.editCampgrounds = async (req,res,next)=>{
    const campground = await Campground.findById(req.params.id);
    if(!campground)
    {
       req.flash('error','Campground not found') ;
       return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit',{campground});
};

module.exports.deleteCampgrounds = async (req,res,next)=>{
    const {id} = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    req.flash('success','succesfully deleted');
    res.redirect('/campgrounds');
};