const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');
const opts = { toJSON: { virtuals: true } };
 
const imageSchema = new Schema({
        url : String,
        filename : String
});

imageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload','/upload/w_100');
});

const campgroundSchema = new Schema({
    title: String,
    images : [imageSchema],
    price: Number,
    description : String,
    location: String,
    geometry : {
        type : {
        type : String,
        enum :['Point'],
        required : true
    },
        coordinates : {
            type: [Number],
            required : true
        }
    },
    author: {
        type : Schema.Types.ObjectId, ref : 'User'
    },
    reviews : [
        {
            type : Schema.Types.ObjectId, ref : 'Review'
        }
    ]
},opts);

campgroundSchema.virtual('properties.popupMarkup').get(function() {
    return (`<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0, 20)}</p>`)
});

campgroundSchema.post('findOneAndDelete',async function(campground){
    if(campground)
    {
        await Review.remove({_id: {$in: campground.reviews}})
    }
});

module.exports = mongoose.model('campground',campgroundSchema);