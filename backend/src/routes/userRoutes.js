import { Router } from 'express';
import { userController } from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { changePasswordLimiter } from '../middleware/rateLimiter.js';
import { updateProfileSchema, changePasswordSchema } from '../validators/userValidator.js';

const router = Router();

// All user routes require authentication
router.use(authenticate);

router.get('/me', userController.getMe);
router.patch('/me', validate(updateProfileSchema), userController.updateMe);
router.patch('/me/password', changePasswordLimiter, validate(changePasswordSchema), userController.changePassword);

export default router;
