const mongoose = require("mongoose")


const schema = new mongoose.Schema({
    fname:{
        type:String
    },
    lname:{
        type:String
    },
    email:{
        type:String
    },
    phone:{
        type:String
    }
})

const model =new mongoose.model("course",schema)

module.exports = model;