
// user.model.js
// Defines the User schema and model for MongoDB.
//
// Used in:
//   - Phase 1: Database setup and user storage
//   - Phase 2: Authentication (registration, login, password storage)
//
// Fields:
//   - email: unique user email (String)
//   - fullName: user's full name (String)
//   - password: hashed password (String)
//   - profilePic: optional profile picture URL (String)
//
// This model is used by authentication controllers and middleware.
import mongoose from "mongoose";


// Define the schema for user documents
const userSchema = new mongoose.Schema(
  {
    // User's email address (must be unique, required for login)
    email: {
      type: String,
      required: true,
      unique: true,
    },
    // User's full name (required for registration)
    fullName: {
      type: String,
      required: true,
    },
    // Hashed password (required for authentication, min 6 chars)
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    // Optional profile picture URL (can be empty)
    profilePic: {
      type: String,
      default: "",
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);


// Create the User model from the schema
const User = mongoose.model("User", userSchema);

// Export the User model for use in controllers and routes
export default User;
