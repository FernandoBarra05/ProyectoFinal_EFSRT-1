/**
 * storage.js
 * Módulo para la gestión de la persistencia de datos en localStorage.
 * Simula una base de datos local para el sistema de inventario.
 */

const STORAGE_KEYS = {
    PRODUCTS: 'inventario_productos',
    MOVEMENTS: 'inventario_movimientos'
};

const SEED_DATA = {
    products: [
        { id: '1', name: 'Arroz Extra 1kg', category: 'Abarrotes', price: 4.50, stock: 50, minStock: 20 },
        { id: '2', name: 'Aceite Vegetal 1L', category: 'Abarrotes', price: 9.80, stock: 30, minStock: 15 },
        { id: '3', name: 'Cemento Sol 42.5kg', category: 'Ferretería', price: 28.50, stock: 100, minStock: 30 },
        { id: '4', name: 'Martillo de Uña 16oz', category: 'Ferretería', price: 15.00, stock: 12, minStock: 5 },
        { id: '5', name: 'Cuaderno Engrapado A4', category: 'Librería', price: 3.20, stock: 200, minStock: 50 },
        { id: '6', name: 'Lapicero Azul (Caja x12)', category: 'Librería', price: 10.50, stock: 40, minStock: 10 },
        { id: '7', name: 'Leche Gloria Tarro 400g', category: 'Abarrotes', price: 4.20, stock: 8, minStock: 20 }, // Alerta
        { id: '8', name: 'Pintura Látex Blanco 1gl', category: 'Ferretería', price: 45.00, stock: 3, minStock: 5 },  // Alerta
        { id: '9', name: 'Pegamento PVC 1/4gl', category: 'Ferretería', price: 18.00, stock: 5, minStock: 10 },    // Alerta
        { id: '10', name: 'Papel Bond A4 75g (Millar)', category: 'Librería', price: 25.00, stock: 15, minStock: 20 } // Alerta
    ],
    movements: [
        { id: 'm1', productId: '1', quantity: 50, date: '2026-06-20', type: 'entrada', personInCharge: 'Juan Perez' },
        { id: 'm2', productId: '3', quantity: 100, date: '2026-06-21', type: 'entrada', personInCharge: 'Maria Lopez' },
        { id: 'm3', productId: '1', quantity: 5, date: '2026-06-22', type: 'salida', personInCharge: 'Juan Perez' }
    ]
};

const Storage = {
    /**
     * Inicializa el almacenamiento con datos de ejemplo si está vacío.
     */
    init() {
        if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(SEED_DATA.products));
        }
        if (!localStorage.getItem(STORAGE_KEYS.MOVEMENTS)) {
            localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(SEED_DATA.movements));
        }
    },

    // --- Productos ---
    getProducts() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
    },

    saveProducts(products) {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    },

    getProductById(id) {
        return this.getProducts().find(p => p.id === id);
    },

    addProduct(product) {
        const products = this.getProducts();
        product.id = Date.now().toString(); // ID único basado en timestamp
        products.push(product);
        this.saveProducts(products);
        return product;
    },

    updateProduct(id, updatedData) {
        let products = this.getProducts();
        products = products.map(p => p.id === id ? { ...p, ...updatedData } : p);
        this.saveProducts(products);
    },

    deleteProduct(id) {
        let products = this.getProducts();
        products = products.filter(p => p.id !== id);
        this.saveProducts(products);
    },

    // --- Movimientos ---
    getMovements() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.MOVEMENTS) || '[]');
    },

    addMovement(movement) {
        const movements = this.getMovements();
        movement.id = 'm' + Date.now();
        movement.date = movement.date || new Date().toISOString().split('T')[0];
        movements.push(movement);
        localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements));

        // Actualizar stock del producto automáticamente
        const product = this.getProductById(movement.productId);
        if (product) {
            const newStock = movement.type === 'entrada' 
                ? product.stock + movement.quantity 
                : product.stock - movement.quantity;
            this.updateProduct(product.id, { stock: newStock });
        }
    }
};

// Exportar para uso en otros archivos (si se usa type="module")
// export default Storage;
