const mongoose = require("mongoose");

const db = ()=>{

    /*mongoose.set is used to enable the strict mode.
    it means the db will only save the data of attributes those are define in schema*/
    mongoose.set('strictQuery', true);

    //database connection
    mongoose.connect(`mongodb://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@ac-7ierchj-shard-00-00.aekwpjg.mongodb.net:27017,ac-7ierchj-shard-00-01.aekwpjg.mongodb.net:27017,ac-7ierchj-shard-00-02.aekwpjg.mongodb.net:27017/?ssl=true&replicaSet=atlas-12t5gz-shard-0&authSource=admin&retryWrites=true&w=majority`,).then(()=>{
        console.log("Database connected successfully!");
    }).catch((err)=>{
        console.log(err);
    })
}

module.exports = db;
