const mongoose = require('mongoose'); // Import Mongoose

const Document= new mongoose.Schema({  // Create Schema
    _id: String, //id of the document
    data: Object    //data of the document
});

module.exports = mongoose.model('Document', Document); // Export Model