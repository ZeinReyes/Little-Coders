import express from 'express';
import {
  getUsers,
  getUserById,
  addUser,
  updateUser,
  deleteUser,
} from '../controller/userController.js';

const router = express.Router();

router.get('/', getUsers);
router.get('/:id', getUserById);
router.post('/', addUser);
router.put('/:id', updateUser);     
router.delete('/:id', deleteUser);

export default router;
