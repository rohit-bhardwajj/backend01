import { Router } from "express";
import { verifyJWT } from "../middlwares/auth.middleware";
import { getAllVideos,publishVideo } from "../controllers/video.controller";
import { upload } from "../middlwares/multer.middleware";

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
