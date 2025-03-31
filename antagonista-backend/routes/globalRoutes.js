import express from "express";
const router = express.Router();

// Rotas públicas (ex.: para listagem de produtos e categorias)
import {
  getAllProducts,
  getProductById,
  searchProducts,
  getProductsByOffer,
  getCategories
} from "../controllers/productController.js";
import { validateObjectId } from "../middlewares/validationMiddleware.js";

router.route('/products')
  .get(getAllProducts) // Listagem com paginação e filtros
  .get(searchProducts); // Busca por query string

router.get('/products/offers/:offerName', getProductsByOffer);

router.route('/products/:productId')
  .get(validateObjectId, getProductById);

router.route('/categories')
  .get(getCategories);

export default router;
