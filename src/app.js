const express = require('express');
const { engine } = require('express-handlebars');
const { Server } = require('socket.io');
const path = require('path');
const ProductManager = require('./managers/ProductManager');

const app = express();
const productManager = new ProductManager();

// Configurar Handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // Servir archivos estáticos

// Rutas
const productsRouter = require('./routes/products');
const cartsRouter = require('./routes/carts');
const viewsRouter = require('./routes/views');

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);

// Configurar servidor
const PORT = 8080;
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Configurar Socket.io
const io = new Server(server);

// Manejar conexiones de WebSocket
io.on('connection', (socket) => {
    console.log('Cliente conectado');

    // Enviar lista inicial de productos al conectar
    productManager.getProducts().then(products => {
        socket.emit('updateProducts', products);
    });

    // Escuchar evento para agregar producto
    socket.on('addProduct', async (product) => {
        try {
            await productManager.addProduct(product);
            const products = await productManager.getProducts();
            io.emit('updateProducts', products); // Actualizar todos los clientes
        } catch (error) {
            socket.emit('error', 'Error al agregar producto');
        }
    });

    // Escuchar evento para eliminar producto
    socket.on('deleteProduct', async (productId) => {
        try {
            await productManager.deleteProduct(parseInt(productId));
            const products = await productManager.getProducts();
            io.emit('updateProducts', products); // Actualizar todos los clientes
        } catch (error) {
            socket.emit('error', 'Error al eliminar producto');
        }
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});