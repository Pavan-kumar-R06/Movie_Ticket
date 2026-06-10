import mongoose from "mongoose";

const userSchema =new mongoose.Schema({
    _id:{type:String,requried:true},
    name:{type:String,requried:true},
    email:{type:String,requried:true},
    image:{type:String,requried:true}
})

const User =mongoose.model('User',userSchema)

export default User;