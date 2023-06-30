const mongoose = require('mongoose');
main().catch(err => console.log(err));
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp',
  { useNewUrlParser: true, 
    useUnifiedTopology : true});
}

const {descriptors,places} = require('./seedHelpers');
const Campground = require('../models/campground');
const cities = require('./cities');

const Sample = array => array[Math.floor(Math.random()*array.length)];

const seedDb = async () =>{
    await Campground.deleteMany({});
    for(let i=0;i<200;i++)
    {
        const random1000 = Math.floor(Math.random()*1000);
        const price = Math.floor(Math.random()*30)+1;
        const c = new Campground({title : `${Sample(descriptors)}, ${Sample(places)}`,
        author : '6499a5495702bbbf41bdab2e',
        location : `${cities[random1000].city},${cities[random1000].state}`,
        geometry :  { type: 'Point',
         coordinates: [ cities[random1000].longitude, cities[random1000].latitude ] },
        //image : 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80',
        description : 'Beautiful & serene',
        price,
        images : [ {
            url: 'https://res.cloudinary.com/dscpidvbv/image/upload/v1663687725/YelpCamp/z6o01zwgvrumykgako9s.jpg',
            filename: 'YelpCamp/z6o01zwgvrumykgako9s'
          },
          {
            url: 'https://res.cloudinary.com/dscpidvbv/image/upload/v1663687725/YelpCamp/ihpwiaku1f2gka5jjl75.jpg',
            filename: 'YelpCamp/ihpwiaku1f2gka5jjl75'
          }
      ]
    });
        await c.save();
    }
}

seedDb().then(()=>{
    mongoose.connection.close();
});
