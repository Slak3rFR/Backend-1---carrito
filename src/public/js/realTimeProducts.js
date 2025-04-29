const socket = io();

socket.on('connect', () => {
    console.log('Conectado al servidor WebSocket');
});

// Actualizar la lista de productos
socket.on('updateProducts', (products) => {
    const productsList = document.getElementById('productsList');
    productsList.innerHTML = '';
    products.forEach(product => {
        const li = document.createElement('li');
        li.setAttribute('data-id', product.id);
        li.innerHTML = `
            <strong>${product.title}</strong> (ID: ${product.id})<br>
            Descripción: ${product.description}<br>
            Precio: $${product.price}<br>
            Categoría: ${product.category}<br>
            Stock: ${product.stock}<br>
            <button onclick="deleteProduct(${product.id})">Eliminar</button>
        `;
        productsList.appendChild(li);
    });
});

// Manejar errores
socket.on('error', (message) => {
    alert(message);
});

// Enviar formulario para agregar producto
document.getElementById('addProductForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const product = {
        title: formData.get('title'),
        description: formData.get('description'),
        code: formData.get('code'),
        price: parseFloat(formData.get('price')),
        status: true, // Por defecto true
        stock: parseInt(formData.get('stock')),
        category: formData.get('category'),
        thumbnails: formData.get('thumbnails') ? [formData.get('thumbnails')] : []
    };
    socket.emit('addProduct', product);
    e.target.reset(); // Limpiar formulario
});

// Función para eliminar producto
function deleteProduct(id) {
    socket.emit('deleteProduct', id);
}