const mongoose  = require("mongoose");

async function server(){
    await mongoose.connect(process.env.MONGO_URI);
}

module.exports = server;
server();