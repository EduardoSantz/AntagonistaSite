import express from "express";
const router = express.Router();
import {
  createOrder,
  getUserOrders,
  getOrder,
  updateOrderStatus,
  deleteOrder
} from "../controllers/orderController.js";
import { validateOrderItems, validateObjectId } from "../middlewares/validationMiddleware.js";
import { checkAccess } from "../middlewares/accessControl.js";

router.route('/')
  .post(validateOrderItems, createOrder)
  .get(getUserOrders);

router.route('/:orderId')
  .get(validateObjectId, getOrder)
  .put(checkAccess('Master', 'Coordenador'), updateOrderStatus)
  .delete(checkAccess('Master'), deleteOrder);

export default router;
