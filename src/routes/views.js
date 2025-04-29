const express = require('express');
const router = express.Router();
const ProductManager = require('../managers/ProductManager');

const productManager = new ProductManager();

// Ruta para la vista home
router.get('/', async (req, res) => {
    const products = await productManager.getProducts();
    res.render('home', { products });
});

// Ruta para la vista realTimeProducts
router.get('/realtimeproducts', async (req, res) => {
    const products = await productManager.getProducts();
    res.render('realTimeProducts', { products });
});

module.exports = router;