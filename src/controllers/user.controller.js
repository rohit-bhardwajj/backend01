import asyncHandler from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import { User } from '../models/user.model.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import jwt from 'jsonwebtoken'
import { verifyJWT } from '../middlwares/auth.middleware.js'

const generateAccessAndRefreshTokens = async(userId)=>{
  try{
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken;
    await user.save({ ValidateBeforeSave : false })
//as other field will be triggering like password is needed
  
      return {accessToken,refreshToken}
  }
  catch(err){
    throw new ApiError(500,"Something went wrong while creating Access and Refresh tokens",err);
  }
}

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

const loginUser = asyncHandler(async(req,res)=>{

    // const{username="",email="",password} = req.body
    const{username,email,password} = req.body

    if (!username && !email) {
      throw new ApiError(400, "Username or email is required");
    }
    if(username?.trim()===""){    
        throw new ApiError(400,"Username is required")    
    }
    if(email?.trim()===""){
        throw new ApiError(400,"Email is required")
      }
    if(!password || password.trim()===""){
      throw new ApiError(400, "Password is required");
    }
    
     const user = await User.findOne({
      $or:[{username},{email}]
     })
     if(!user){
      throw new ApiError(404,"User does not exist")
     }

     const isPasswordValid = await user.isPasswordCorrect(password)
     if(!isPasswordValid){
      throw new ApiError(401,"Invalid User credentials")
     }
    const{accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)
     
    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    )
    //cookies : securing them will restrict them from being modified
     const options={
      httpOnly: true,
      secure:true
     }

     return res
     .status(200)
     .cookie("accessToken",accessToken,options)
     .cookie("refreshToken",refreshToken,options)
     .json(
      new ApiResponse(
        200,
        {
          user:loggedInUser,accessToken,refreshToken
        }//data field in apiresponse constructor
        ,
        "User logged In Successfully"
      )
     )

})

const logoutUser = asyncHandler(async(req,res)=>{
   
   await User.findByIdAndUpdate(
    req.user._id,
    {
      $set : {
        refreshToken : undefined
      }
    },
    {
      new : true //gives updated document
    }
   )//refreshToken removed from dB, wt abt cookies?

   const options={
    httpOnly: true,
    secure:true
   }

   return res
   .status(200)
   .clearCookie("accessToken",options)
   .clearCookie("refreshToken",options)
   .json(new ApiResponse(200,{},"User logged out"))
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
    
   const incomingrefreshToken = req.cookies.refreshToken || req.body.refreshToken;

   if(!incomingrefreshToken){
    throw new ApiError(401,"Unauthorized request")
   }

      const decodedToken = jwt.verify(incomingrefreshToken,process.env.REFRESH_TOKEN_SECRET)

     const user = await User.findById(decodedToken?._id)
     if(!user){
      throw new ApiError(401,"Invalid refresh token")
     }
     if(incomingrefreshToken !== user?.refreshToken){
      throw new ApiError(401,"Refresh token is expired or used")
     }
     const options = {
      httpOnly:true,
      secure : true
     }
     const {accessToken,newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
     return res
     .status(200)
     .cookie("accessToken",accessToken,options)
     .cookie("refreshToken",newRefreshToken,options)
     .json(
      new ApiResponse(
        200,
        {
          accessToken,
          refreshToken:newRefreshToken
        },
        "Access token refreshed"
      )
     )
  })

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken
}