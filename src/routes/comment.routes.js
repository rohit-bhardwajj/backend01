import {Router} from 'express'
import { verifyJWT } from '../middlwares/auth.middleware.js';
import { createComment,deleteComment,updateComment } from '../controllers/comment.controller.js';

const router = Router();

router.use(verifyJWT);

router.route("/:videoId").post(createComment)
// router.route("/c/:commentId")
router.route("/c/:commentId").delete(deleteComment).patch(updateComment)

export default router;