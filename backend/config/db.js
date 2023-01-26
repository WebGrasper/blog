const mongoose = require("mongoose");

const db = ()=>{

    /*mongoose.set is used to enable the strict mode.
    it means the db will only save the data of attributes those are define in schema*/
    mongoose.set('strictQuery', true);

    //database connection
    mongoose.connect('mongodb://127.0.0.1:27017/blog',).then(()=>{
        console.log("Database connected successfully!");
    }).catch((err)=>{
        console.log(err);
    })
}

module.exports = db;