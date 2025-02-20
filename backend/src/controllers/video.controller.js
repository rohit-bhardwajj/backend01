import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { deleteFromCloudinary,deleteVideoFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import {Video} from '../models/video.model.js'
import { isValidObjectId } from "mongoose";
import { extractPublicId } from "../utils/extractPublicId.js";

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
const updateVideo = asyncHandler(async(req,res)=>{
    //find video
    const {videoId} = req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid Video Id")
    }
    const {title,description} = req.body
    const isNewThumbnail = req.body.isNewThumbnail === 'true';
    // console.log(title,description,typeof(isNewThumbnail));
    
     const video = await Video.findById(videoId)
     if(!video){
        throw new ApiError(404,"Invalid Video Id")
     }
     if(!(video.owner).equals(req.user._id)){
        throw new ApiError(403,"You are not authorized to update Video details!")
     }
     let updatedThumbnail = null;

    if(isNewThumbnail){
        const thumbnailLocalPath = req.file?.path
        if(!thumbnailLocalPath){
         throw new ApiError(400,"Thumbnail is required") 
       }
       const newThumbnail = await uploadOnCloudinary(thumbnailLocalPath,"thumbnails")
       if(!newThumbnail){
        throw new ApiError(400,"Invalid thumbnail path, upload again")
       }
         updatedThumbnail = newThumbnail.url;
       //delete old thumbnail
       if(video.thumbnail){
        const oldThumbnailPublicId = extractPublicId(video.thumbnail,"thumbnails")
        if(!oldThumbnailPublicId){
            throw new ApiError(400,"Invalid Old Thumbnail url")
        }
        await deleteFromCloudinary(oldThumbnailPublicId)
       }
    }
    //add available fields to updateFields
    const updateFields = {} 
    if(title && title.trim()!=="") updateFields.title = title.trim()
    if(description && description.trim()!=="") updateFields.description = description.trim()
    if(updatedThumbnail) updateFields.thumbnail = updatedThumbnail

    if (Object.keys(updateFields).length === 0) {
        throw new ApiError(400, "No valid fields provided for update");
    }
    
    
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set:updateFields
        },
        {
            new:true
        }
    )

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {updatedVideo},
            "Video details updated successfully"
        )
    )
})
const deleteVideo = asyncHandler(async(req,res)=>{
    const {videoId} = req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid Video Id")
    }
    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"Video not found")
    }
    if(!(video.owner).equals(req.user?._id)){
        throw new ApiError(403,"You are not authorized to make changes to this Video")
    }


    const deletedVideo = await Video.findByIdAndDelete(
        videoId
    )
    if(!deletedVideo){
        throw new ApiError(500,"Error in deleting the video!")
    }


    // delete thumbnail & video from cloudinary
    const VideoUrl = video.videoFile;
    const thumbnailUrl = video.thumbnail;
    if(!VideoUrl) throw new ApiError(404,"Invalid Cloudinary Video Url") 
    if(!thumbnailUrl) throw new ApiError(404,"Invalid Cloudinary thumbnail Url") 
    const VideoPublicId = extractPublicId(VideoUrl,"videos")
    const thumbnailPublicId = extractPublicId(thumbnailUrl,"thumbnails")
    await deleteVideoFromCloudinary(VideoPublicId)
    await deleteFromCloudinary(thumbnailPublicId)

    

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {deletedVideo},
            "Video deleted successfully"
        )
    )
})
const togglePublishStatus = asyncHandler(async(req,res)=>{
    const {videoId} = req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid Video Id")
    }
    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"Video not found")
    }
    if(!(video.owner).equals(req.user?._id)){
        throw new ApiError(403,"You are not authorized to make changes to this Video")
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set:{
                isPublished : !video.isPublished
            }
        },
        {
            new:true
        }
    )

    if(!updatedVideo) throw new ApiError(500,"Error in Updating Video")
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {updatedVideo},
            "Video publish status toggled successfully"

        )
    )

})
const IncreaseVideoViews = asyncHandler(async(req,res)=>{
    const {videoId} = req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid Video Id")
    }
    // const video = await Video.findById(videoId);
    // if(!video){
    //     throw new ApiError(404,"Video not found")
    // }
    const UpdatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $inc :{
                views:1
            }
        },
        {
            new : true
        }
    ).select("title description views")
    if(!UpdatedVideo){
        throw new ApiError(500,"Error updating video views!")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {UpdatedVideo},
            "Video views updated"
        )
    )

})



export {publishVideo,getAllVideos,IncreaseVideoViews,getVideoById,updateVideo,deleteVideo,togglePublishStatus}
