import express from "express";
const router = express.Router();
import {
  createAddress,
  getAddresses,
  getAddress,
  updateAddress,
  deleteAddress,
  getDefaultAddress,
  setDefaultAddress
} from "../controllers/addressController.js";
import { validateAddressInput, validateObjectId } from "../middlewares/validationMiddleware.js";

router.route('/')
  .post(validateAddressInput, createAddress)
  .get(getAddresses);

router.route('/:addressId')
  .get(validateObjectId, getAddress)
  .put(validateObjectId, validateAddressInput, updateAddress)
  .delete(validateObjectId, deleteAddress);

router.route('/default')
  .get(getDefaultAddress)
  .put(validateObjectId, setDefaultAddress);

export default router;
