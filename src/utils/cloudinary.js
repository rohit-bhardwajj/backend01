import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'
import { ApiError } from './ApiError.js'

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_SECRET_KEY
})

const uploadOnCloudinary = async (localFilePath)=>{
    try{
        if(!localFilePath) {
            throw new ApiError(409,"Unable to find Image's local-path")
        }
        //nahi to upload it on cloudinary
       const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto",
            folder:"videotube"
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

export {uploadOnCloudinary}