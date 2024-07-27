const mongoose = require('mongoose');
const validator = require("validator");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require("crypto");
const { Schema } = mongoose;


const UserSchema = new Schema({
   name: {
      type: String,
      required: [true, 'Please Enter Your Name'],
      maxLength: [30, 'Name cannot exceed 30 characters'],
      minLength: [5, 'Name Should have more than 5 characters']
   },
   email: {
      type: String,
      required: [true, 'Please Enter Your Email'],
      unique: true,
      validate: [validator.isEmail, "Please Enter a valid Email"]
   },
   password: {
      type: String,
      required: [true, 'Please Enter Your Password'],
      minLength: [8, 'Password Should be greater than 8 characters'],
      select: false
   },
   avatar:
   {
      public_id: {
         type: String,
         required: true
      },
      url: {
         type: String,
         required: true
      }
   },
   role: {
      type: String,
      default: "user"
   },
   createdAt:{
    type:Date,
    default:Date.now,
   },
   resetPasswordToken: String,
   resetPasswordExpire: Date,
});

/* 
1. pre is event and call before saving in the database
2. use async function because use this keyword only in normal function but not use arrow function
3. use hash method and convert password into 10 digit string
4. use ismodidied method and this method return boolean(true or false )
*/

UserSchema.pre("save", async function (next) {

   if (!this.isModified("password")) {
      next();
   }
   this.password = await bcrypt.hash(this.password, 10);
});

/*
1. create json web token
2. use methods(getjwttoken) function and return sign function and give Admin signature , object for exprie time
*/
UserSchema.methods.getJWTToken = function () {
   return jwt.sign({ id: this._id }, process.env.SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
   });
};

/*
1.campare password
2.use methods(camparePassword) function and return compare function to compare entered password and database password 
*/
UserSchema.methods.comparePassword = async function (password) {
   return await bcrypt.compare(password, this.password);
}

/* 
1. generating Password Reset Token
2. randombytes is a crypto method and generate (buffer value) then use tostring method and convert (buffer value) into (gargabes value) and use parameter(hex) inside toString method to convert (token)
3. use (createhash methods)--->for creatinh hash with help of using parameter--->(sha256)--> Alogorthium and then use (update) methods ---> to update generating token(resettoken) and futher use (digest) method ---> then convert token    
*/
UserSchema.methods.getResetPasswordToken = function(){
    
   const resetToken = crypto.randomBytes(20).toString("hex");
   this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
   this.resetPasswordExpire = Date.now() + 15*60*1000; 
   return resetToken;
}

module.exports =mongoose.model('user', UserSchema);