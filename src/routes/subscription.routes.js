import {Router} from 'express'
import { verifyJWT } from '../middlwares/auth.middleware.js';
import { toggleSubscription } from '../controllers/subscription.controller.js';
const router = new Router();
router.use(verifyJWT)
router.route("/c/:channelId").get(toggleSubscription)

export default router;