import { Router } from "express";
import { registerUser,loginUser,logoutUser,refreshAccessToken,updateUserCoverImage } from "../controllers/user.controller.js";
import {upload} from '../middlwares/multer.middleware.js'
import {verifyJWT} from '../middlwares/auth.middleware.js'

const router = Router()

router.route("/register").post(
    upload.fields([
        {name : "avatar",
        maxCount:1
        },
        {name: "coverImage",
        maxCount:1
        }
     ]),//middleware (to add fields to request at route)
    registerUser)

router.route("/login").post(loginUser)

router.route("/logout").post(verifyJWT,logoutUser)

router.route("/refresh-token").post(refreshAccessToken)
// router.route("/update-avatar").post(verifyJWT,upload.single('avatar'),updateUserAvatarImage)
router.route("/update-coverImage").post(verifyJWT,upload.single('coverImage'),updateUserCoverImage)

export default router;