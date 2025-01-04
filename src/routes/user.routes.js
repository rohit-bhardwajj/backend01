import { Router } from "express";
import { registerUser,loginUser,logoutUser } from "../controllers/user.controller.js";
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

export default router;