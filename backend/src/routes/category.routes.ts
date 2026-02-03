import { Router } from 'express';
import { getAllCategories, getCategoryBooks } from '../controllers/category.controller';

const router = Router();

router.get('/', getAllCategories);
router.get('/:slug/books', getCategoryBooks);

export default router;
