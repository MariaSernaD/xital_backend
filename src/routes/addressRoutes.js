import express from 'express';
import {getUserAddresses, getUserAddressById, createAddress, updateAddress, deleteAddress} from '../controllers/addressController.js';

const router = express.Router();

router.get('/address', getUserAddresses);
router.get('/address/:id', getUserAddressById);
router.post('/address', createAddress);
router.put('/address/:id', updateAddress);
router.delete('/address/:id', deleteAddress);

export default router;