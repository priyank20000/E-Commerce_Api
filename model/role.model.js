const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const roleSchema = new mongoose.Schema({
    username: { 
        type: String, // use 1
        required: true 
    },
    password: {
        type: String,  //
        required: true 
    },
    roles: {
        type: mongoose.Schema.Types.ObjectId,  //sub
        ref: 'Permission' 
    }
});

roleSchema.methods.getJWTToken = function (){
    return jwt.sign({
        id: this.id 
    }, process.env.SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    })
}
// Hash password before saving
roleSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Compare password method
roleSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const Role = new mongoose.model('Role', roleSchema);

module.exports = Role;
