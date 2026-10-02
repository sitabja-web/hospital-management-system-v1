import { Router } from 'express';
import { asyncHandler } from '../lib/errors.js';
import * as controller from '../controllers/departmentController.js';

const router = Router();
router.get('/', asyncHandler(controller.list));
export default router;