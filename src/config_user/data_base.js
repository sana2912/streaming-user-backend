// we will use this file for coonnecting to DB  and export to use at express app
const mongoose = require('mongoose');
require('dotenv').config();
const connect_database = async () => {
    await mongoose.connect(process.env.MONGODB_URl)
        .then(() => console.log('connect-database success'))
        .catch((message) => { console.log(message) })
}

module.exports = connect_database;