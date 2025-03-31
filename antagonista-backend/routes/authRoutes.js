import express from "express";
const router = express.Router();
import { registerUser, loginUser, loginAdmin } from "../controllers/authController.js";
import { validateUserInput, validateLogin } from "../middlewares/validationMiddleware.js";

router.post('/register', validateUserInput, registerUser);
router.post('/login', validateLogin, loginUser);
router.post('/admin/login', validateLogin, loginAdmin);

export default router;
