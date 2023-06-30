if(process.env.NODE_ENV !=='production')
{
    require('dotenv').config();
}

const express = require('express');
const helmet = require('helmet');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const morgan = require('morgan');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const ExpressError = require('./utils/ExpressError');
const campgroundsRouter = require('./routes/campgrounds');
const reviewsRouter = require('./routes/reviews');
const userRouter = require('./routes/users');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
const MongoStore = require('connect-mongo');


//'mongodb://localhost:27017/yelp-camp'
main().catch(err => console.log(err));
async function main() {
  await mongoose.connect(dbUrl,
  { useNewUrlParser: true, 
    useUnifiedTopology : true,
   // useCreateIndex : true,
   // useFindAndModify : false
    });
}

const secret = process.env.SECRET || "hushhush";

const store = new MongoStore({
    mongoUrl : dbUrl,
    secret,
    touchAfter : 24 * 60 * 60
})

store.on('error',function(e){
    console.log("Session Store Erroe");
})

const sessionConfig = {
    store,
    name : 'session',
    secret,
    resave : false,
    saveUninitialized : true,
    cookie : {
        httpOnly : true,
        expires : Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge : 1000 * 60 * 60 * 24 * 7
    }
}
/*app.use(helmet());


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dscpidvbv/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);*/

app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

app.use(express.static(path.join(__dirname,'public')));
app.use(express.urlencoded({extended : true}));
app.use(methodOverride('_method'));
app.use(morgan('tiny'));
app.use(mongoSanitize());
app.use(helmet({contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false,
   crossOriginEmbedderPolicy: false,
   originAgentCluster: false,
  permittedCrossDomainPolicies: false
}));
app.use(flash());
app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) =>{
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    //res.locals.status = 500;
    next();
})

app.use('/',userRouter);
app.use('/campgrounds',campgroundsRouter);
app.use('/campgrounds/:id/reviews',reviewsRouter);


app.get('/',(req,res)=>{
    res.render('home');
});

app.use('*',(req,res,next)=>{
    next(new ExpressError('Page Not Found',404));
});

app.use((err,req,res,next)=>{
    const status = err.status || 500;
    
    const {message} = err.message;
    res.status(status);
    res.render('error',{err});
});

const port = process.env.PORT || 3000;
app.listen(port,()=>{
    console.log(`PORT ${port}`);
});