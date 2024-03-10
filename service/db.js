require('dotenv').config();
const mongoose = require('mongoose');

const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;

mongoose.connect(`mongodb+srv://${DB_USER}:${DB_PASS}@cluster0.8mnxtks.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
).then(() => {
    console.log("Conectado ao banco");
}).catch((err) => console.log(err));

module.exports = mongoose;
