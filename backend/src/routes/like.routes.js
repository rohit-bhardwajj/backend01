import {Router} from 'express'
import { toggleVideoLike,toggleCommentLike,getLikedVideos } from '../controllers/like.controller.js'
import { verifyJWT } from '../middlwares/auth.middleware.js'
const router = Router()

router.use(verifyJWT)
router.route("/toggle/v/:videoId").patch(toggleVideoLike)
router.route("/toggle/c/:commentId").patch(toggleCommentLike)
router.route("/videos").get(getLikedVideos)


export default router