import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {Video} from '../models/video.model.js'
import { isValidObjectId } from "mongoose";

const publishVideo = asyncHandler(async(req,res)=>{

    const {title,description} = req.body
    if([title,description].some((field)=>field?.trim()==="")){
        throw new ApiError(400,"Title and Description are required")
    }

    const videoFileLocalPath = req.files?.videoFile[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

    if(!videoFileLocalPath){
        throw new ApiError(409,"Video File is required")
    }
    if(!thumbnailLocalPath){
        throw new ApiError(409,"Thumbnail File is required")
    }
    const videoFile = await uploadOnCloudinary(videoFileLocalPath,"videos")
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath,"thumbnails")

    if(!videoFile.url){
        throw new ApiError(409,"Unable to upload Video to cloudinary")
    }
    if(!thumbnail){
        throw new ApiError(409,"Unable to upload thumbnail to cloudinary")
    }
    
    const video = await Video.create({
        title,
        description,
        videoFile:videoFile.url,
        thumbnail:thumbnail.url,
        duration:videoFile.duration,
        owner:req.user?._id
    })
    if(!video){
        throw new ApiError(500,"Something went wrong while uploding the video")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            video,
            "Video uploaded successfully"
        )
    )

})
const getAllVideos = asyncHandler(async(req,res)=>{
    const {page=1,limit=10,skip,query,sortBy,sortType,userId} = req.query

    const videos = await Video.aggregate([
        {
            $match:{
                $or:[{title:{$regex:query,$options:"i"}},
                    {description:{$regex:query,$options:"i"}}]
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"uploadedBy",
                pipeline:[{
                    $project:{
                        fullName:1,
                        username:1,
                        avatar:1
                    }
                }]
            }
        },
        {
            $unwind:"$uploadedBy"
        },
        {
            $project:{
                title:1,
                description:1,
                videoFile:1,
                thumbnail:1,
                uploadedBy:1
            }
        },
        {
            $sort:{
                [sortBy]:sortType === 'asc'? 1 : -1
            }
        },
        {
            $skip:(page-1)*limit
        },{
            $limit:parseInt(limit)
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {videos},
            "All videos are fetched successfully"
        )
    )
})
const getVideoById = asyncHandler(async(req,res)=>{
  const {videoId} = req.params
  if(!isValidObjectId(videoId)){
    throw new ApiError(400,"Invalid Video Id")
  }
  const video = await Video.findById(videoId);
  if(!video){
    throw new ApiError(404,"Video does not exist!")
  }

  return res
  .status(200)
  .json(new ApiResponse(
    200,
    {video},
    "Video Fetched Successfully"
  ))
})



export {publishVideo,getAllVideos,getVideoById}
