import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { generateToken } from '../middleware/authMiddleware.js';



export const registerUser = async (req, res) => {
  const { name, email, password,role } = req.body;  
  
  if(!name || !email || !password) {
    return res.status(400).json({"message":"Please provide all required fields"});
  }
  const userExist = await User.findOne({email:email});

  if(userExist) {
    return res.status(400).json({"message":"User already exists"});
  }
  
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password,salt);

    const user = await User.create({
        name,
        email,
        password : hashedPassword,
        role: role || 'user',
    });
    res.status(201).json({
        _id : user._id,
        name : user.name,
        email : user.email,
        role: user.role,
        token : generateToken(user._id)
    })


  
}

export const loginUser = async(req,res)=>{
    const {email,password} = req.body;

    if(!email || !password)
{
    return res.status(400).json({"messge":"Please provide all required fields"});
}
    const user = await User.findOne({email});

    if(!user){
        return res.status(400).json({"message":"Invalid credentials"})
    }

    const match = await bcrypt.compare(password,user.password);

    if(!match){
        return res.status(400).json({"message":"Invalid credentials"})
    }

    res.status(200).json({
        _id : user._id,
        email : user.email,
        name : user.name,
        role: user.role,
        token : generateToken(user._id)
    })

   
}