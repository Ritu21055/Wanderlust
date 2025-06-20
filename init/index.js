const mongoose = require("mongoose");
const initData = require("./data.js"); // Your array of sample listings
const Listing = require("../models/listing.js"); // Your Listing Mongoose model
const User = require("../models/user.js"); // Assuming you have a User model

// MongoDB connection URL
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// Main function to connect to DB and initialize it
async function main() {
    await mongoose.connect(MONGO_URL);
    console.log("connected to DB");
}

// Function to initialize the database with sample data
const initDB = async () => {
    // 1. Delete all existing listings to start fresh
    await Listing.deleteMany({});
    console.log("Existing listings deleted.");

    // 2. IMPORTANT: Delete all existing users (if you want to reset users too)
    //    If you want to keep existing users, comment out this line.
    await User.deleteMany({});
    console.log("Existing users deleted.");

    // 3. Create a default user for seeding (if not already existing)
    //    This ID (68517bd746321dcc3df9e53b) needs to exist in your users collection
    //    or be newly created here.
    let sampleUser = await User.findOne({ username: "wanderlustuser" });
    if (!sampleUser) {
        // Create a new user if one doesn't exist. You might need to adjust this
        // based on your User model and how you typically create users (e.g., using passport-local-mongoose's register)
        // For seeding simplicity, we'll create a basic one.
        sampleUser = new User({
            email: "wanderlust@example.com",
            username: "wanderlustuser"
        });
        await User.register(sampleUser, "password"); // Assuming passport-local-mongoose register method
        console.log("Default user created for seeding.");
    }

    // 4. Transform data to assign the owner field
    const transformedData = initData.data.map(listing => ({
        ...listing,
        // *** THIS IS THE CRUCIAL CORRECTION ***
        // We removed the 'image' transformation because:
        // 1. data.js already provides image as { url: String, filename: String }
        // 2. models/listing.js expects image as { url: String, filename: String }
        // So, no transformation is needed for the image field.
        // ***************************************

        // Assign the owner to the newly created sample user's ID
        owner: sampleUser._id // Assign the actual ObjectId from the created user
    }));

    // 5. Insert the transformed data into the Listing collection
    await Listing.insertMany(transformedData);
    console.log("Data inserted with owner field");
};

// Execute the main function, then initDB, then close connection
main()
    .then(() => initDB()) // Call initDB after connection is established
    .then(() => {
        console.log("data was initialized");
        // Close connection when all operations are done
        return mongoose.connection.close();
    })
    .catch(err => {
        console.error("Error during initialization:", err);
        // Ensure connection is closed even on error
        if (mongoose.connection.readyState === 1) { // 1 means connected
            mongoose.connection.close();
        }
    });