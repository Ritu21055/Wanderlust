const express = require("express");
const router = express.Router();
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/user.js");

// Signup routes
router.get("/signup", userController.renderSignupForm);
router.post("/signup", userController.signup);

// Login routes
router.get("/login", userController.renderLoginForm);
router.post("/login", saveRedirectUrl, passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }), userController.login);

// Logout route
router.get("/logout", userController.logout);

module.exports = router;
