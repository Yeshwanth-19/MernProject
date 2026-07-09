import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    mobile: {
      type: String,
      required: function () {
        return !this.googleId && this.isNew;
      },
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId && this.isNew;
      },
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    avatar: {
      type: String,
    },
    role: {
        type:String,
        enum:['trader', 'admin', 'manager'],
        default:'trader',
    },
    resetPasswordToken: {
        type: String,
    },
    resetPasswordExpires: {
        type: Date,
    },
    kycVerified: {
        type: Boolean,
        default: false,
    },
    kycStatus: {
        type: String,
        enum: ['not_submitted', 'pending', 'approved', 'rejected'],
        default: 'not_submitted',
    },
    kycVerifiedAt: {
        type: Date,
    },
    kycSubmittedAt: {
        type: Date,
    },
    kycRejectionReason: {
        type: String,
    },
    encryptedPan: {
        type: String,
    },
    aadhaarLast: {
        type: String,
    },
    kycDocuments: {
        aadhaarFront: String,
        aadhaarBack: String,
        panCard: String,
    },
},
    {timestamps:true}
);
export default mongoose.model("User", userSchema);