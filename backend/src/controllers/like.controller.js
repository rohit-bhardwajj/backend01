import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    //find if video is already liked ,then unlike logic
    //find such like doc ,which has video containing curr vid id & likedby as req.user._id
    //if found then unlike logic,otherwise
    //to like a video create like doc with such details
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new ApiError(404, "Invalid Video Id")
    }
    const likedVideo = await Like.findOne(
        {
            $and: [{ video: videoId }, { likedBy: req.user?._id }]
        }
    )
    if (!likedVideo) {
        const toggleLike = await Like.create(
            {
                video: videoId,
                likedBy: req.user?._id
            }
        )
        if (!toggleLike) {
            throw new ApiError(500, "Error liking the video!")
        }
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { toggleLike },
                    "Video Liked successfully"
                )
            )
    }
    if (likedVideo) {
        const toggleDislike = await Like.findByIdAndDelete(likedVideo._id);
        if (!toggleDislike) {
            throw new ApiError(500, "Error Disliking the video")
        }
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { toggleDislike },
                    "video Disliked successfully"
                )
            )
    }


})
const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid Comment Id");
    }
    const FoundLikedComment = await Like.findOne(
        {
            $and: [{ Comment: commentId }, { likedBy: req.user._id }]
        }
    );
    if (!FoundLikedComment) {
        //then like it
        const LikedComment = await Like.create({
            Comment: commentId,
            likedBy: req.user?._id
        })
        if (!LikedComment) {
            throw new ApiError(500, "Error Liking the comment");
        }
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { LikedComment },
                    "Comment Liked Successfully"
                )
            )
    }
    if (FoundLikedComment) {
        const UnlikedComment = Like.findByIdAndDelete(FoundLikedComment._id)
        if (!UnlikedComment) {
            throw new ApiError(500, "Error Unliking the Comment");
        }
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { UnlikedComment }
                    ,
                    "Comment Unliked successfully"
                )
            )
    }



})
const getLikedVideos = asyncHandler(async (req, res) => {
    const AllLikedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        _id:0,
                                        username: 1,
                                        fullName: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $unwind:"$owner"
                    },
                    {
                        $project: {
                            title: 1,
                            description: 1,
                            thumbnail: 1,
                            videoFile: 1,
                            views: 1,
                            owner: 1
                        }
                    } ]
                
            }
        }, {
            $unwind: "$video"
        },{
            $project:{
                video:1,
                likedBy:1
            }
        }
    ])
    if (!AllLikedVideos || AllLikedVideos.length == 0) {
        throw new ApiError(500, "Error fetching liked videos");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { AllLikedVideos },
                "Liked videos fetched successfully"
            )
        )
})

export { toggleVideoLike, toggleCommentLike, getLikedVideos }
