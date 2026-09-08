const mongoose=require('mongoose');

const userSchema= new mongoose.Schema({
 email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
  isVerified:{type:Boolean,default:false},
  otp:{type:String},
  expires:{type:Date}
},{timestamps:true})

module.exports =mongoose.model("User",userSchema);
