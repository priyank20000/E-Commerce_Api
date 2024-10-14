const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
    name: { 
        type: String, // sub admin
        required: true
    },
    permissions: [{
        type: mongoose.Schema.Types.ObjectId, /// per
        ref: 'Permissionname'
    }]
});


const Permission = new mongoose.model('Permission', permissionSchema);

module.exports = Permission;
