import mongoose from "mongoose";

const digilockerUser = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    mobile:{
        type:String,
        required:true,
    },
    digilockerId:{
        type:String,
        required:true,
        unique:true,  
    },
    isVerified:{
        type:Boolean,
        default:false,
    }

})
export default mongoose.model("DigilockerUser", digilockerUser);