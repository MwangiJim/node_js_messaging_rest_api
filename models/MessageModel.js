import mongoose from "mongoose";

const Messages = mongoose.Schema({
    Message:String,
    TimeCreated:String,
    DateCreated:String,
    Receipient:String
})

export default mongoose.model('messages',Messages);