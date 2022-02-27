const mongoose = require('mongoose')

const mongodb=()=>{

    mongoose.connect("mongodb://127.0.0.1:27017/education")
    .then(()=>{
        console.log("Database succesfully Connected")
    }).catch((err)=>{
        console.log("Data not connected")
        console.log(err)
    })
}

module.exports = mongodb