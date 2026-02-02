import mongoose from "mongoose";

const authCodeSchema = new mongoose.Schema({
    code:{
        type:String,
        required:true,
    },                  
    userid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"DigilockerUser",       
        required:true,
    },
    isUsed:{
        type:Boolean,
        default:false,
    },
    expiresAt:{                 
        type:Date,
        required:true,
    }
},
{timestamps:true}
);

export default mongoose.model("AuthCode", authCodeSchema);