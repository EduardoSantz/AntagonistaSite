import express from "express";
const router = express.Router();
import { getUser, updateUser, updatePassword } from "../controllers/userController.js";

router.route('/me')
  .get(getUser)
  .put(updateUser);

router.put('/me/password', updatePassword);

export default router;
