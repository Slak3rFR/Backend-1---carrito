const express = require('express');
const router = express.Router();
const CartManager = require('../managers/CartManager');

const cartManager = new CartManager();

router.post('/', async (req, res) => {
    const newCart = await cartManager.createCart();
    res.status(201).json(newCart);
});

router.get('/:cid', async (req, res) => {
    const cart = await cartManager.getCartById(parseInt(req.params.cid));
    if (!cart) return res.status(404).json({ error: 'Cart not found' });
    res.json(cart);
});

router.post('/:cid/product/:pid', async (req, res) => {
    const cart = await cartManager.addProductToCart(parseInt(req.params.cid), parseInt(req.params.pid));
    if (!cart) return res.status(404).json({ error: 'Cart not found' });
    res.json(cart);
});

module.exports = router;