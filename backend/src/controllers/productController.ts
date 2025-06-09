import { Request, Response } from 'express';
import Product from '../models/Product';
import { AuthRequest } from '../middleware/auth';

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, price, category, images, stock } = req.body;
    const userId = req.user.id;

    const product = await Product.create({
      name,
      description,
      price,
      category,
      images: images || [],
      stock,
      userId,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: 'Error creating product' });
  }
};

export const getProducts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Product.findAndCountAll({
      where: { userId },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.json({
      products: rows,
      total: count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching products' });
  }
};

export const getProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const product = await Product.findOne({
      where: { id, userId },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching product' });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    const product = await Product.findOne({
      where: { id, userId },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await product.update(updates);
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: 'Error updating product' });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const product = await Product.findOne({
      where: { id, userId },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await product.destroy();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting product' });
  }
}; 