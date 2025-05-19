const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

module.exports = (io) => {
    router.get('/', async (req, res) => {
        try {
            // Parámetros de consulta
            const { limit = 10, page = 1, sort, query } = req.query;

            // Filtros
            let filter = {};
            if (query) {
                if (query === 'true' || query === 'false') {
                    filter.status = query === 'true';
                } else {
                    filter.category = query;
                }
            }

            // Ordenamiento
            let sortOption = {};
            if (sort === 'asc') sortOption.price = 1;
            if (sort === 'desc') sortOption.price = -1;

            // Paginación
            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                sort: sortOption,
            };

            // Consultar productos con paginación
            const result = await Product.paginate(filter, options);

            // Construir respuesta
            const response = {
                status: 'success',
                payload: result.docs,
                totalPages: result.totalPages,
                prevPage: result.prevPage,
                nextPage: result.nextPage,
                page: result.page,
                hasPrevPage: result.hasPrevPage,
                hasNextPage: result.hasNextPage,
                prevLink: result.hasPrevPage ? `/api/products?limit=${limit}&page=${result.prevPage}${sort ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}` : null,
                nextLink: result.hasNextPage ? `/api/products?limit=${limit}&page=${result.nextPage}${sort ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}` : null,
            };

            res.json(response);
        } catch (error) {
            res.status(500).json({ status: 'error', error: error.message });
        }
    });

    router.get('/:pid', async (req, res) => {
        try {
            const product = await Product.findById(req.params.pid);
            if (!product) return res.status(404).json({ error: 'Product not found' });
            res.json(product);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    router.post('/', async (req, res) => {
        const { title, description, code, price, status, stock, category, thumbnails } = req.body;
        if (!title || !description || !code || !price || status === undefined || !stock || !category) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        if (price < 0 || stock < 0) {
            return res.status(400).json({ error: 'Price and stock cannot be negative' });
        }
        try {
            const newProduct = await Product.create({
                title, description, code, price, status, stock, category, thumbnails: thumbnails || []
            });
            const products = await Product.find();
            io.emit('updateProducts', products);
            res.status(201).json(newProduct);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    router.put('/:pid', async (req, res) => {
        const { price, stock } = req.body;
        if (price !== undefined && price < 0) {
            return res.status(400).json({ error: 'Price cannot be negative' });
        }
        if (stock !== undefined && stock < 0) {
            return res.status(400).json({ error: 'Stock cannot be negative' });
        }
        try {
            const updatedProduct = await Product.findByIdAndUpdate(req.params.pid, req.body, { new: true });
            if (!updatedProduct) return res.status(404).json({ error: 'Product not found' });
            const products = await Product.find();
            io.emit('updateProducts', products);
            res.json(updatedProduct);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    router.delete('/:pid', async (req, res) => {
        try {
            const result = await Product.findByIdAndDelete(req.params.pid);
            if (!result) return res.status(404).json({ error: 'Product not found' });
            const products = await Product.find();
            io.emit('updateProducts', products);
            res.json({ message: 'Product deleted' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    return router;
};