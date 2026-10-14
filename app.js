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



const dbUrl = normalizeMongoUrl(process.env.ATLASDB_URL);

function normalizeMongoUrl(value) {
    if (typeof value !== "string") {
        return "";
    }
    let url = value.trim();
    if (
        (url.startsWith('"') && url.endsWith('"')) ||
        (url.startsWith("'") && url.endsWith("'"))
    ) {
        url = url.slice(1, -1).trim();
    }
    return url;
}

function summarizeMongoUrl(uri) {
    const srv = uri.startsWith("mongodb+srv://");
    const standard = uri.startsWith("mongodb://");
    const withoutScheme = uri.replace(/^mongodb(\+srv)?:\/\//, "");
    const at = withoutScheme.lastIndexOf("@");
    const hostAndPath = at === -1 ? withoutScheme : withoutScheme.slice(at + 1);
    const host = hostAndPath.split("/")[0].split("?")[0];
    const database = (hostAndPath.split("/")[1] || "").split("?")[0];
    return {
        protocol: srv ? "mongodb+srv" : standard ? "mongodb" : "unrecognized",
        host: host || "(missing)",
        database: database || "(none)",
        hasCredentials: at !== -1,
    };
}

function logMongoFailure(err) {
    const error = err || {};
    const cause = error.cause || {};
    console.error("MongoDB connection failed.");
    if (error.name) console.error("name:", error.name);
    if (error.code) console.error("code:", error.code);
    if (error.syscall) console.error("syscall:", error.syscall);
    if (error.hostname) console.error("hostname:", error.hostname);
    if (cause.code || cause.syscall || cause.hostname) {
        console.error("cause code:", cause.code || "");
        console.error("cause syscall:", cause.syscall || "");
        console.error("cause hostname:", cause.hostname || "");
    }
    const safeMessage = String(error.message || "").replace(
        /mongodb(\+srv)?:\/\/([^@\s/]+)@/gi,
        "mongodb$1://[redacted]@"
    );
    if (safeMessage) console.error("message:", safeMessage);

    const code = error.code || cause.code;
    const syscall = error.syscall || cause.syscall;
    if (syscall === "querySrv" && code === "ENOTFOUND") {
        console.error(
            "DNS SRV lookup failed for the host in ATLASDB_URL. That hostname is missing, mistyped, or no longer exists. A wrong password fails later with an authentication error, after DNS succeeds."
        );
    }
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true})); //saara data req ke andar parse hopaye
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

async function startServer() {
    if (!dbUrl) {
        console.error("MongoDB connection aborted: ATLASDB_URL is not set.");
        process.exit(1);
    }

    const target = summarizeMongoUrl(dbUrl);
    console.log(
        `MongoDB target protocol=${target.protocol} host=${target.host} database=${target.database} credentials=${target.hasCredentials ? "present" : "missing"}`
    );

    try {
        await mongoose.connect(dbUrl);
    } catch (err) {
        logMongoFailure(err);
        process.exit(1);
    }

    console.log("connected to DB");
    mongoose.connection.on("error", (err) => {
        logMongoFailure(err);
    });
    mongoose.connection.on("disconnected", () => {
        console.error("MongoDB disconnected. Database operations will fail until the connection is restored.");
    });

    const store = MongoStore.create({
        mongoUrl: dbUrl,
        crypto: {
            secret: process.env.SECRET,
        },
        touchAfter: 24 * 3600,
    });

    store.on("error", (err) => {
        console.error("error in mongo session store");
        logMongoFailure(err);
    });

    const sessionOptions = {
        store,
        secret: process.env.SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: {
            expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
        },
    };

    app.use(session(sessionOptions));
    app.use(flash());

    app.use(passport.initialize());
    app.use(passport.session());
    passport.use(new LocalStrategy(User.authenticate()));

    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());

    app.use((req, res, next) => {
        res.locals.success = req.flash("success");
        res.locals.error = req.flash("error");
        res.locals.currUser = req.user;
        next();
    });

    app.use((req, res, next) => {
        console.log(`${req.method} ${req.url}`);
        next();
    });

    app.get("/", (req, res) => {
        res.redirect("/listings");
    });

    app.use("/listings/:id/reviews", reviewRouter);
    app.use("/listings", listingRouter);
    app.use("/", userRouter);

    app.all("*", (req, res, next) => {
        next(new ExpressError(404, "Page not found!"));
    });

    app.use((err, req, res, next) => {
        let { statusCode = 500, message = "something went wrong!" } = err;
        res.status(statusCode).render("error.ejs", { statusCode, message });
    });

    const port = process.env.PORT || 8080;
    app.listen(port, () => {
        console.log(`server is listening on port ${port}`);
    });
}

startServer();
