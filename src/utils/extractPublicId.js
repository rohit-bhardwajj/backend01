import { Cloudinary_Folder } from '../constants.js'

const extractPublicId = (publicUrl) => {
    if (!publicUrl || typeof (publicUrl) !== "string") {
        throw new Error("Invalid Cloudinary Url")
    }
    const parts = publicUrl.split("/");
    const fileName = parts[parts.length - 1];
    const publidId = fileName.split(".")[0];

    const finalPublicId = `${Cloudinary_Folder}/${publidId}`
    return finalPublicId;
}

export {extractPublicId}