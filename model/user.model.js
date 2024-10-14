const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const validator = require("validator");
const bcrypt = require('bcrypt');
const crypto = require("crypto");
const Schema=mongoose.Schema

const pagesSchema = new Schema({
    "privacy-policy" : { type: String, required: true },
    "terms-condition": { type: String, required: true },
    "refund": { type: String, required: true }
});


const userSchema = new mongoose.Schema({
    image:{
        type: String,
        required: false
    },
    name:{
        type:String,
        required: false
    },
    email_id:{
        type:String,
        required: false,
        validate: [validator.isEmail, "Please Enter a valid Email"]
    },
    password:{
        type:String,
        required: false
    },
    role: {
        type: String,
        enum: ['guest', 'user'],
        default: 'user'
    },
    pages: {
        type: pagesSchema
    },
    phone_number: {
        type: String,
        required: false
    },
    otp: {
        type: String,
        required: false
    },
    otpExpires: {
        type: Date,
        required: false
    },
    isDeleted: { 
        type: Boolean,
        default: false 
    },
    token: {
        type: String
    },
    guestId: {
        type: String
    },
    isGuest: {
        type: Boolean,
        default: false
    },
    new_user: {
        type: Boolean
    },
    status: {
        type: String
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
},
{ timestamps:true }
)

//JwT Token 
userSchema.methods.getJWTToken = function (){
    return jwt.sign({
        id: this.id,
        email: this.email_id   
    }, process.env.SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    })
}
///////////password hase ////////
userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    // Ensure guestId matches _id if role is guest
    if (this.role === 'guest') {
        this.isGuest = true;
        this.guestId = this._id.toString();
    } else {
        this.isGuest = false;
        this.guestId = undefined;
    }

    next();
});
// Compare Password

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};
  

// Generating Password Reset Token
userSchema.methods.getResetPasswordToken = function () {
    // Generating Token
    const resetToken = crypto.randomBytes(20).toString("hex");
  
    // Hashing and adding resetPasswordToken to userSchema
    this.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
  
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  
    return resetToken;
};


// Generate OTP for user
userSchema.methods.generateOTP = function () {
    const OTP = Math.floor(100000 + Math.random() * 900000).toString();
    this.otp = OTP;
    this.otpExpires = Date.now() + 1 * 60 * 1000; // OTP expires in 3 minute

    // Schedule task to delete user if OTP expires
    scheduleDeleteUser(this._id, this.otpExpires);

    return OTP;
};

// Function to schedule automatic deletion of user if OTP expires
function scheduleDeleteUser(userId, expiryTime) {
    const delay = expiryTime - Date.now();

    setTimeout(async () => {
        try {
            const user = await User.findById(userId);

            if (user && user.otpExpires < Date.now()) {
                await User.deleteOne({ _id: userId });
                console.log(`User ${userId} deleted due to expired OTP.`);
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    }, delay);
}



const User = new mongoose.model('User', userSchema);

module.exports = User;


