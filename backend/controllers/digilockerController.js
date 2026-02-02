import mongoose from "mongoose";
import DigilockerUser from "../models/DigilockerUser";
import { v4 as uuid } from "uuid";
import AuthCode from "../models/AuthCode.js";

const registerUser = async(req,res)=>{
    const { mobile } = req.body;

    if(!mobile){
        return res.status(400).json({"message":"Please provide mobile number"});
    }
    const user = await DigilockerUser.findOne({
        mobile:mobile
    });

    if(user && user.isVerified){
        const authCode = uuid();

        await AuthCode.create({
            code : authCode,
            userid: user._id,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000) 
        });
        return res.status(200).json({
            status:"success",
            message:"User already registered and verified",
            
        })
            
    };

    const digilockerId = "DGL"+Date.now();
}