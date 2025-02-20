import { Cloudinary_Folder } from '../constants.js'

const extractPublicId = (publicUrl,Folder) => {
    const rootFolder = "videotube"
    if (!publicUrl || typeof (publicUrl) !== "string") {
        throw new Error("Unable to extract public Id")
    }
    const parts = publicUrl.split("/");
    const fileName = parts[parts.length - 1];
    const publicId = fileName.split(".")[0];

    const finalPublicId = `${rootFolder}/${Folder}/${publicId}`
    return finalPublicId;
}

export {extractPublicId}