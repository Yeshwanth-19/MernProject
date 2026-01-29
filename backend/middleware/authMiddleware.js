import User from '../models/User.js';
import jwt from 'jsonwebtoken';

export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
        try {
            if (token) {

                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                req.user = await User.findById(decoded.id).select('-password');
                next();
            }
        } catch (error) {
            console.error(error);
            res.status(401).json({ "message": "Not authorized, token failed" });
        }
    }
    else {
        res.status(401).json({ "message": "Not authorized, no token" });
    }
}

export const generateToken = (id) => {{
    return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn:'30d',
    })  
}                
}
