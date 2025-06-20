// --- GLOBAL UNCAUGHT EXCEPTION / UNHANDLED REJECTION HANDLERS ---
process.on('uncaughtException', (err) => {
    console.error('CRITICAL: Uncaught Exception detected!');
    console.error(err.stack); // Log the full stack trace
    // It's generally unsafe to continue after an uncaught exception
    // A graceful shutdown might involve closing DB connections, etc.
    // For now, we'll just log and exit.
    process.exit(1); // Exit with a failure code
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('CRITICAL: Unhandled Promise Rejection detected!');
    console.error('Promise:', promise);
    console.error('Reason:', reason.stack || reason); // Log the full stack trace if available
    // You might want to handle this more gracefully than immediate exit in production,
    // but for debugging, it's good to know.
    process.exit(1); // Exit with a failure code
});
// --- END GLOBAL HANDLERS ---





if(process.env.NODE_ENV != "production") {
   require("dotenv").config();
}

const express = require("express");
const app= express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const userRouter = require("./routes/user.js");



const dbUrl = process.env.ATLASDB_URL;

main().then(()=>{
 console.log("connected to DB");
}).catch(err =>{
    console.log(err);
})


async function main(){
    await mongoose.connect(dbUrl);
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true})); //saara data req ke andar parse hopaye
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

const store = MongoStore.create({
    mongoUrl : dbUrl,
    crypto :{
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error",()=>{
    console.log("error in mongo session store",err);
})


const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() +  7 * 24 *60 * 60 * 1000,
        maxAge : 7 * 24 *60 * 60 * 1000,
        httpOnly : true
    },
};

// app.get("/",(req,res)=>{
//     res.send("Hi,I am root");      // this is the api
// });


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
     res.locals.error = req.flash("error");
     res.locals.currUser = req.user;
    next();
})

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});


app.use("/listings/:id/reviews",reviewRouter);  
app.use("/listings",listingRouter);
app.use("/",userRouter);


app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page not found!"));
});

app.use((err,req,res,next) =>{
    let {statusCode,message="something went wrong!"} = err;
    res.status(statusCode).render("error.ejs",{message});
    // res.status(statusCode).send(message);
})

app.listen(8080,()=>{
    console.log("server is listening on 8080 port");
})

