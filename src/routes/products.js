const express = require('express');
const router = express.Router();
const ProductManager = require('../managers/ProductManager');

const productManager = new ProductManager();

router.get('/', async (req, res) => {
    const products = await productManager.getProducts();
    res.json(products);
});

router.get('/:pid', async (req, res) => {
    const product = await productManager.getProductById(parseInt(req.params.pid));
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
});

router.post('/', async (req, res) => {
    const { title, description, code, price, status, stock, category, thumbnails } = req.body;
    if (!title || !description || !code || !price || status === undefined || !stock || !category) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    const newProduct = await productManager.addProduct({
        title, description, code, price, status, stock, category, thumbnails: thumbnails || []
    });
    res.status(201).json(newProduct);
});

router.put('/:pid', async (req, res) => {
    const updatedProduct = await productManager.updateProduct(parseInt(req.params.pid), req.body);
    if (!updatedProduct) return res.status(404).json({ error: 'Product not found' });
    res.json(updatedProduct);
});

router.delete('/:pid', async (req, res) => {
    const result = await productManager.deleteProduct(parseInt(req.params.pid));
    if (result.length === (await productManager.getProducts()).length) {
        return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted' });
});

module.exports = router;