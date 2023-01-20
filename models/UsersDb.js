import mongoose from "mongoose";

const Users = mongoose.Schema({
    Name:String,
    PhoneNumber:Number,
    Password:String
})

export default mongoose.model("users",Users)