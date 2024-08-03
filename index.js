require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
// Google Login
const passport = require("passport");
const session = require("express-session");

require("./passport.js");

const userRoutes = require("./routes/user.js");
const productRoutes = require("./routes/product.js");
const cartRoutes = require("./routes/cart.js");
const orderRoutes = require("./routes/order.js");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
     origin: ["http://ec2-18-218-227-238.us-east-2.compute.amazonaws.com/b7/", "http://localhost:4007", "http://localhost:3000", 'http://zuitt-bootcamp-prod-421-7175-inciong.s3-website.us-east-1.amazonaws.com'],
     credentials: true,
     optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(
     session({
          secret: process.env.clientSecret,
          resave: false,
          saveUninitialized: false,
     })
);
app.use(passport.initialize());
app.use(passport.session());

app.use("/b7/users", userRoutes);
app.use("/b7/products", productRoutes);
app.use("/b7/carts", cartRoutes);
app.use("/b7/order", orderRoutes);

// Connect to MongoDB Database
mongoose.connect(process.env.MONGODB_STRING);

mongoose.connection.once("open", () => console.log("Now connected to MongoDB Atlas"));

if (require.main === module) {
     app.listen(process.env.PORT || 4007, () => {
          console.log(`API is now Online at port ${process.env.PORT || 4007}`);
     });
}

