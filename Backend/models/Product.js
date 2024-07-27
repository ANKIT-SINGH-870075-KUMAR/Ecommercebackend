const mongoose = require('mongoose');
const { Schema } = mongoose;
const ProductSchema = new Schema({
   name: {
      type: String,
      required: [true,'Please Enter Product Name'],
      trim: true 
   },
   description: {
      type: String,
      required: [true,'Description Please Enter Product Description']
   },
   price: {
      type: Number,
      required: [true,'Please Enter Product Price'],
      maxLength: [8,"Price cannot exceed 8 characters"]
   },
   ratings: {
      type: Number,
      default: 0
   },
   images: [
      {
         public_id: {
            type: String,
            required: true
         },
         url: {
            type: String,
            required: true
         }
      }
   ],
   category: {
      type: String,
      required: [true,'Please Enter Product Category']
   },
   stock: {
      type: Number,
      required: [true,'Please Enter Product stock'],
      maxLength: [4,"Stock cannot exceed 4 characters"],
      default: 1
   },
   number_of_reviews: {
      type: Number,
      default: 0
   },
   reviews: [
      {
         user:{
            type:mongoose.Schema.ObjectId,
            ref:"user",
            required:true,
         },
         name: {
            type: String,
            required: true
         },
         rating: {
            type: Number,
            required: true
         },
         comment: {
            type: String,
            required: true
         }
      }
   ],

   //show admin details
   user:{
      type:mongoose.Schema.ObjectId,
      ref:"user",
      required:true,
   },
   createdAt: { 
      type: Date,
      default: Date.now
   },
});

module.exports = mongoose.model('product', ProductSchema);