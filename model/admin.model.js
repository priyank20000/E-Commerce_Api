const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const adminSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: true }
});

//JwT Token 
adminSchema.methods.getJWTToken = function (){
    return jwt.sign({
        id: this.id,
        isAdmin: this.isAdmin   
    }, process.env.SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    })
}
///////////password hase ////////
adminSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
      next();
    }
  
    this.password = await bcrypt.hash(this.password, 10);
});
// Compare Password

adminSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};
  


const Admin = new mongoose.model('Admin', adminSchema);

module.exports = Admin;


