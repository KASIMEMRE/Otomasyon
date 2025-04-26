import express from 'express';
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllRecords,
  updateRecordStatus,
  getDashboardStats,
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, admin);

router.get('/stats', getDashboardStats);

router.route('/users')
  .get(getUsers);

router.route('/users/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

router.route('/records')
  .get(getAllRecords);

router.put('/records/:id/status', updateRecordStatus);

export default router;