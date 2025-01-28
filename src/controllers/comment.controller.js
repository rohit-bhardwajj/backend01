import { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createComment = asyncHandler(async(req,res)=>{
    console.log(req.body);
    
    const {comment} = req.body;
    const {videoId} = req.params;
    if(!comment || comment.trim() === ""){
        throw new ApiError(400,"Comment is required")
    }
    if(!isValidObjectId(videoId)) throw new ApiError(400,"Invalid video Id")
    const video = await Video.findOne({
        $and:[{_id:videoId},{isPublished:true}]    
    });
    if(!video)throw new ApiError(500,"Video not found")
    const newComment = await Comment.create({
        content:comment,
        video:videoId,
        owner:req.user?._id
    })
    if(!newComment)throw new ApiError(500,"Error in creating the comment")
        
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        {newComment},
        "Comment created successfully"
    ))
})
const updateComment = asyncHandler(async(req,res)=>{
    const {commentId} = req.params
    const {comment} = req.body;
    if(!isValidObjectId(commentId)) throw new ApiError(400,"Invalid comment id")
    if(!comment || comment.trim() === "") throw new ApiError(400,"Comment is required")
    
    const CommentFound = await Comment.findOne({
        $and:[{_id:commentId},{owner:req.user?._id}]
    });
    if(!CommentFound)throw new ApiError(404,"Not authorized to update comment details")
    
    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set:{
                content:comment
            }
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
            {updatedComment},
            "Comment updated successfully"
        )
    )

})

export {createComment,updateComment}