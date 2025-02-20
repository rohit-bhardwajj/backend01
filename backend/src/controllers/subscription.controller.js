import { isValidObjectId } from "mongoose";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";


export const toggleSubscription = asyncHandler(async(req,res)=>{
    //i'll create a subscription, by putting the currentChannel in channel field
    //& put user into subscriber
    const {channelId} = req.params
    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid channel id")
    }
    const SubscriptionFound = await Subscription.findOne({
        $and:[{channel : channelId},{subscriber:req.user?._id}]
    })
    
    if(!SubscriptionFound){
        const toggleSubscribe = await Subscription.create({
        channel : channelId,
        subscriber : req.user?._id
    })
    if(!toggleSubscribe){
        throw new ApiError(500,"Error in subscribing the channel")
    }
    return res.status(200).json(
        new ApiResponse(200,
            toggleSubscribe,
            "Successfully subscribed the channel"
        )
    )
    }
    else{
        const toggleUnsubscribe = await Subscription.findByIdAndDelete(SubscriptionFound._id)
        if(!toggleUnsubscribe){
            throw new ApiError(500,"Error in unsubscribing the channel")
        }
        return res.status(200).json(new ApiResponse(
            200,
            toggleUnsubscribe,
            "Successfully unsubscribed the channel"
        ))
    }
})