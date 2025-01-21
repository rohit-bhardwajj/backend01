import { Router } from "express";
import { verifyJWT } from "../middlwares/auth.middleware.js";
import { deleteVideo, getAllVideos,getVideoById,publishVideo, togglePublishStatus, updateVideo } from "../controllers/video.controller.js";
import { upload } from "../middlwares/multer.middleware.js";

const router = Router()
router.use(verifyJWT)

router.route("/")
.get(getAllVideos)
.post(
    upload.fields([{
        name:"videoFile",
        maxCount:1
    },{
        name:"thumbnail",
        maxCount:1
    }]), publishVideo)
router.route("/:videoId")
.get(getVideoById)
.patch(upload.single("thumbnail"),updateVideo)
.delete(deleteVideo)

router.route("/toggle/publish/:videoId")
.patch(togglePublishStatus)

    export default router;