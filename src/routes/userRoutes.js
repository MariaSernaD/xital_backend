import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import {getUsers, getUserById, createUser, updateUser, deleteUser} from '../controllers/userController.js';

const router = express.Router();

router.get('/user', authMiddleware,getUsers);
router.get('/user/:id', authMiddleware, getUserById);
router.post('/user', authMiddleware, createUser);
router.put('/user/:id', authMiddleware, updateUser);
router.delete('/user/:id', authMiddleware, deleteUser);

export default router;
