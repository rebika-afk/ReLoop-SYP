import { Router } from 'express';
import { adminController } from '../controllers/adminController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// All admin routes require authentication and ADMIN role
router.use(authenticate, authorizeRoles('ADMIN'));

router.get('/ping', adminController.ping);

export default router;

