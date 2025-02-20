import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'
import { ApiError } from './ApiError.js'
import asyncHandler from './asyncHandler.js'

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_SECRET_KEY
})

const uploadOnCloudinary = async (localFilePath,folder)=>{
    const rootFolder = "videotube"
    try{
        if(!localFilePath) {
            throw new ApiError(409,"Unable to find Image's local-path")
        }
        //nahi to upload it on cloudinary
       const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto",
            folder:folder?`${rootFolder}/${folder}`:folder
        })
        //file uploaded
        // console.log("File has been uploaded on cloudinary ",response.url);
        // console.log("File has been uploaded on cloudinary ",response);
        fs.unlinkSync(localFilePath);//delete the file from local server
        return response;
    }

    catch(error){
        console.error("Cloudinary upload failed:", error);
        if (!fs.existsSync(localFilePath)) {
            throw new ApiError(500, "File not found on server!");
        }
        else{
            fs.unlinkSync(localFilePath);
        }
        
        return null;
    }
}
const deleteFromCloudinary = async(PublicId)=>{
    try{
        if(!PublicId){
            throw new ApiError(400,"Invalid Resource Public Id")
        }
        console.log("\nThis is public id : ",PublicId);
        
        const response = await cloudinary.uploader.destroy(PublicId);
        console.log("\nThis is response : ",response);
        if(response.result!=="ok"){
            throw new ApiError(500,"Unable to delete file from cloudinary")
        }
    }
    catch(error){
        console.error("Cloudinary Deletion failed:", error);
        // console.log("Cloudinary public id:", PublicId);
        throw new ApiError(500, "Error while deleting from Cloudinary");
    }
}
const deleteVideoFromCloudinary = async(PublicId)=>{
    try{
        if(!PublicId){
            throw new ApiError(400,"Invalid Resource Public Id")
        }
        console.log("\nThis is public id : ",PublicId);
        
        const response = await cloudinary.uploader.destroy(PublicId,{
            resource_type:"video"
        });
        console.log("\nThis is response : ",response);
        if(response.result!=="ok"){
            throw new ApiError(500,"Unable to delete file from cloudinary")
        }
    }
    catch(error){
        console.error("Cloudinary Deletion failed:", error);
        // console.log("Cloudinary public id:", PublicId);
        throw new ApiError(500, "Error while deleting from Cloudinary");
    }
}

export {uploadOnCloudinary,deleteFromCloudinary,deleteVideoFromCloudinary}