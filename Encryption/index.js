// DATABASE ENCRYPTION AUTHENTICATION.

const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
var encrypt = require('mongoose-encryption');


// users schema.
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    createAt: {
        type: Date,
        default: Date.now
    }
});

// create schema model.
const User = mongoose.model("users", userSchema);

// defined port.
const port = process.env.PORT || 3000;
const db_url = process.env.DB_ATLAS_URL;
var encryptKey = process.env.ENCRYPT_KEY;


userSchema.plugin(encrypt, { secret: encryptKey, encryptedFields: ['password'] });


// application layer.
app.use(cors());

// body parse.
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// listenning port.
app.listen(port, async () => {
    console.log('Server is running on👉', port)
    await connectDB();
});

// databse connect.
const connectDB = async () => {
    try {
        await mongoose.connect(db_url);
        console.log("😁 Database connect successfull.")
    } catch (error) {
        console.log("🔥 DB not connect.", error.message)
        process.exit(1);
    }
};

// home route.
app.get("/", (req, res) => {
    res.status(200).send(`<h1>Wellcome to server. </h1>`)
});

// register route.
app.post("/register", async (req, res) => {
    try {
        const { email, password } = req.body;
        const newUser = new User({
            email, password
        });
        await newUser.save();
        res.status(201).send(newUser);
    } catch (error) {
        res.status(500).send("something wrong.");
    }
});

// login route.
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email: email }, { password: password });
        if (user) {
            res.status(200).send("Authentic user.")
        } else {
            res.status(404).send("User not found or invalid password.")
        }
    } catch (error) {
        res.status(500).json(error.message);
        process.exit(1);
    }
});

// client side error.
app.use((req, res, next) => {
    res.status(404).send("🚫 Opps not found.")
});

// server side error.
app.use((err, req, res, next) => {
    res.status(500).send("🧯 Internal server error.")
});

