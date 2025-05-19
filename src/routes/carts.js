const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');

router.post('/', async (req, res) => {
    try {
        const newCart = await Cart.create({ products: [] });
        res.status(201).json(newCart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:cid', async (req, res) => {
    try {
        const cart = await Cart.findById(req.params.cid).populate('products.product');
        if (!cart) return res.status(404).json({ error: 'Cart not found' });
        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const cart = await Cart.findById(req.params.cid);
        if (!cart) return res.status(404).json({ error: 'Cart not found' });
        const product = await Product.findById(req.params.pid);
        if (!product) return res.status(404).json({ error: 'Product not found' });

        const productIndex = cart.products.findIndex(p => p.product.toString() === reqffffffffff.params.pid);
        if (productIndex === -1) {
            cart.products.push({ product: req.params.pid, quantity: 1 });
        } else {
            cart.products[productIndex].quantity += 1;
        }
        await cart.save();
        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:cid/products/:pid', async (req, res) => {
    try {
        const cart = await Cart.findById(req.params.cid);
        if (!cart) return res.status(404).json({ error: 'Cart not found' });
        cart.products = cart.products.filter(p => p.product.toString() !== req.params.pid);
        await cart.save();
        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:cid', async (req, res) => {
    try {
        const { products } = req.body;
        if (!Array.isArray(products)) return res.status(400).json({ error: 'Products must be an array' });
        for (const item of products) {
            if (!item.product || !item.quantity || item.quantity < 0) {
                return res.status(400).json({ error: 'Invalid product or quantity' });
            }
            const product = await Product.findById(item.product);
            if (!product) return res.status(404).json({ error: `Product ${item.product} not found` });
        }
        const cart = await Cart.findByIdAndUpdate(req.params.cid, { products }, { new: true });
        if (!cart) return res.status(404).json({ error: 'Cart not found' });
        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:cid/products/:pid', async (req, res) => {
    try {
        const { quantity } = req.body;
        if (!quantity || quantity < 0) return res.status(400).json({ error: 'Invalid quantity' });
        const cart = await Cart.findById(req.params.cid);
        if (!cart) return res.status(404).json({ error: 'Cart not found' });
        const productIndex = cart.products.findIndex(p => p.product.toString() === req.params.pid);
        if (productIndex === -1) return res.status(404).json({ error: 'Product not in cart' });
        cart.products[productIndex].quantity = quantity;
        await cart.save();
        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:cid', async (req, res) => {
    try {
        const cart = await Cart.findById(req.params.cid);
        if (!cart) return res.status(404).json({ error: 'Cart not found' });
        cart.products = [];
        await cart.save();
        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;