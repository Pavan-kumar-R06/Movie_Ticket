import mongoose from "mongoose";

const showSchema =new mongoose.Schema({
    movie:{type:String,requried:true,ref:'Movie'},
    showDateTime:{type:Date,requried:true},
    showPrice:{type:Number,requried:true},
    occupiedSeats:{type:Object,default:{}}
},{minimize:false})

const Show =mongoose.model('Show',showSchema)

export default Show;