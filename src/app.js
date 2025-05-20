const express = require('express');
const { engine } = require('express-handlebars');
const { Server } = require('socket.io');
const path = require('path');
const connectDB = require('./config/db');
const Product = require('./models/Product');

const app = express();

// Conectar a MongoDB
connectDB();

// Configurar Handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configurar servidor
const PORT = 8080;
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Configurar Socket.io
const io = new Server(server);

// Rutas
const productsRouter = require('./routes/products')(io);
const cartsRouter = require('./routes/carts');
const viewsRouter = require('./routes/views');

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter); // Esta línea es clave para manejar rutas como /

// Configurar eventos de Socket.io
io.on('connection', async (socket) => {
    console.log('Cliente conectado');
    const products = await Product.find().lean();
    socket.emit('updateProducts', products);
    socket.on('addProduct', async (product) => {
        try {
            if (!product.title || !product.description || !product.code || !product.price || product.status === undefined || !product.stock || !product.category) {
                throw new Error('Missing required fields');
            }
            if (product.price < 0 || product.stock < 0) {
                throw new Error('Price and stock cannot be negative');
            }
            const newProduct = await Product.create(product);
            const products = await Product.find().lean();
            io.emit('updateProducts', products);
        } catch (error) {
            socket.emit('error', error.message);
        }
    });
    socket.on('deleteProduct', async (productId) => {
        try {
            await Product.findByIdAndDelete(productId);
            const products = await Product.find().lean();
            io.emit('updateProducts', products);
        } catch (error) {
            socket.emit('error', 'Error al eliminar producto');
        }
    });
    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});