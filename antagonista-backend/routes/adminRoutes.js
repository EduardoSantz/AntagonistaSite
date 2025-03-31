import express from "express";
const router = express.Router();
import {
  createAdmin,
  getAllAdmins,
  getAdmin,
  updateAdmin,
  updateAdminPassword,
  deleteAdmin
} from "../controllers/adminController.js";
import { checkAccess } from "../middlewares/accessControl.js";

router.route('/')
  .post(checkAccess('Master', 'Coordenador'), createAdmin)
  .get(checkAccess('Master', 'Coordenador'), getAllAdmins);

router.route('/:adminId')
  .get(checkAccess('Master', 'Coordenador'), getAdmin)
  .put(checkAccess('Master', 'Coordenador'), updateAdmin)
  .delete(checkAccess('Master'), deleteAdmin);

router.put('/:adminId/password', checkAccess('Master', 'Coordenador'), updateAdminPassword);

export default router;
