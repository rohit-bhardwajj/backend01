import asyncHandler from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import { User } from '../models/user.model.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'

const registerUser = asyncHandler( async(req,res)=>{
    // res.status(200).json({
    //     message:"ok"
    // })
    /*
    Get user details from frontend
    check for correct format of userdata & (not empty) (validation)
    check if user already exists/using email/username
    check for images(if correctly recieved & uploaded on cloudinary)
    create user object & create entry in database (& check if got created)
    remove the password & tokens fields from response 
     Check for user creation
    & send successful response to the user
    */
   const {username,fullName,email,password} = req.body;
    // console.log("fullName:",fullName);
    
   if([fullName,email,username,password].some((field)=>field?.trim() === "")){
    throw new ApiError(400,"All fields are required")
   }

 const existedUser = await User.findOne({
        $or : [{username},{email}]
      })
    //   console.log(existedUser)
      // console.log(req.body);

      if(existedUser){
        throw new ApiError(409,"Username or email already exists");
      }

      const avatarLocalPath = req.files?.avatar[0]?.path; //compulsory
      //but localpath can also not exist so apply check for it
      const coverImageLocalPath = req.files?.coverImage?.[0]?.path
    if(!avatarLocalPath){
      throw new ApiError(409,"Avatar file is required")
    }

   const avatar = await uploadOnCloudinary(avatarLocalPath);
  
   const coverImage = await uploadOnCloudinary(coverImageLocalPath);
   
   if(!avatar){
    throw new ApiError(409,"Unable to upload avatar to cloudinary")
    // throw new ApiError(409,"Avatar file is required ")
   }

   const user = await User.create({
    username:username.toLowerCase(),
    fullName,
    avatar:avatar.url,
    coverImage:coverImage?.url||"",
    password,
    email
   })
//check if it was created in db or not

const userCreated = await User.findById(user._id).select(
    "-password -refreshToken" //excluded 
)
   if(!userCreated){
     
    throw new ApiError(500,"Something went wrong while registering the user!")
   }
   
   return res.status(201).json(
     new ApiResponse(200,userCreated,"User registered Successfully")
   )
    
})

export {registerUser}