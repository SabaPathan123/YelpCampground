const User = require('../models/user');

module.exports.renderRegisterUser = (req,res)=>{
    res.render('users/register');
};

module.exports.registerUser = async(req,res)=>{
    try{
        const {email,username,password} = req.body;
        //console.log(username);
        const user = new User({email,username});
        const registeredUser = await User.register(user,password);
        req.login(registeredUser,err => {
            if(err){return next(err)}
            req.flash('success','Welcome to YelpCamp');
            res.redirect('campgrounds');  
        });
    }
    catch(e)
    {
        req.flash('error',e.message);
        res.redirect('register');
    }
};

module.exports.renderLogin = (req,res)=>{
    if(req.query.returnTo)
    {
        req.session.returnTo = req.query.returnTo;
    }
    res.render('users/login');
};

module.exports.login = async(req,res)=>{
    try{
        const url = res.locals.returnTo || '/campgrounds';
        //console.log(url);
        req.flash('success','Welcome Back');
        
        res.redirect(url);
    }
    catch(e)
    {
        req.flash('error',e.message);
        res.redirect('login');
    }
    
};

module.exports.logout = async(req,res) => {
    
    req.logout((err) =>{
        if(err){
            return next(err);
        }
        req.flash('success','Good Bye');
        return res.redirect('/');
     });  
};