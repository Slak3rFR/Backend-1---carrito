const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Cart = require('../models/Cart');

// Ruta raíz: redirigir a /products
router.get('/', (req, res) => {
    res.redirect('/products');
});

// Lista de productos con paginación
router.get('/products', async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, query } = req.query;
        let filter = {};
        if (query) {
            if (query === 'true' || query === 'false') {
                filter.status = query === 'true';
            } else {
                filter.category = query;
            }
        }
        let sortOption = {};
        if (sort === 'asc') sortOption.price = 1;
        if (sort === 'desc') sortOption.price = -1;
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: sortOption,
        };
        const result = await Product.paginate(filter, { ...options, lean: true });
        res.render('products', {
            products: result.docs,
            totalPages: result.totalPages,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            page: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink: result.hasPrevPage ? `/products?limit=${limit}&page=${result.prevPage}${sort ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}` : null,
            nextLink: result.hasNextPage ? `/products?limit=${limit}&page=${result.nextPage}${sort ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}` : null,
        });
    } catch (error) {
        res.status(500).send('Error loading products');
    }
});

// Detalle de producto
router.get('/products/:pid', async (req, res) => {
    try {
        const product = await Product.findById(req.params.pid).lean();
        if (!product) return res.status(404).send('Product not found');
        res.render('productDetail', { product });
    } catch (error) {
        res.status(500).send('Error loading product');
    }
});

// Carrito
router.get('/carts/:cid', async (req, res) => {
    try {
        const cart = await Cart.findById(req.params.cid).populate('products.product').lean();
        if (!cart) return res.status(404).send('Cart not found');
        res.render('cart', { cartId: req.params.cid, products: cart.products });
    } catch (error) {
        res.status(500).send('Error loading cart');
    }
});

// Productos en tiempo real
router.get('/realtimeproducts', async (req, res) => {
    const products = await Product.find().lean();
    res.render('realTimeProducts', { products });
});

module.exports = router;