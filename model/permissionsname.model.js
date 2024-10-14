const mongoose = require('mongoose');

const permissionnameSchema = new mongoose.Schema({
    name: { 
        type: String,  //product
        required: true
    },
    permission: {
        type: String // name 
    }
});


const Permissionname = new mongoose.model('Permissionname', permissionnameSchema);

module.exports = Permissionname;
