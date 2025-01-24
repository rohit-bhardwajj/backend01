import { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async(req,res)=>{
 //find if video is already liked ,then unlike logic
 //find such like doc ,which has video containing curr vid id & likedby as req.user._id
 //if found then unlike logic,otherwise
 //to like a video create like doc with such details
 const {videoId} = req.params
 if(!isValidObjectId(videoId)){
    throw new ApiError(404,"Invalid Video Id")
 }
 const likedVideo = await Like.findOne(
    {
        $and:[{video:videoId},{likedBy:req.user?._id}]
    }
 )
 if(!likedVideo){
    const toggleLike = await Like.create(
        {
            video:videoId,
            likedBy:req.user?._id
        }
    )
    if(!toggleLike){
        throw new ApiError(500,"Error liking the video!")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {toggleLike},
            "Video Liked successfully"
        )
    )
 }
 if(likedVideo){
    const toggleDislike = await Like.findByIdAndDelete(likedVideo._id);
    if(!toggleDislike){
        throw new ApiError(500,"Error Disliking the video")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {toggleDislike},
            "video Disliked successfully"
        )
    )
 }


})


export {toggleVideoLike}
