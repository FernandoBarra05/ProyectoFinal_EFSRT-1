/**
 * app.js
 * Orquestador principal de la aplicación.
 * Gestiona eventos, navegación y coordinación entre Storage y UI.
 */

const App = {
    /**
     * Inicialización de la aplicación.
     */
    init() {
        Storage.init();
        document.getElementById('current-date').innerText = new Date().toLocaleDateString();
        
        this.setupEventListeners();
        this.navigateTo('dashboard'); // Vista por defecto
    },

    /**
     * Configuración de los listeners globales.
     */
    setupEventListeners() {
        // Navegación
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const view = e.currentTarget.getAttribute('data-view');
                this.navigateTo(view);
                
                // Actualizar clase activa
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });

        // Formulario de Productos
        document.getElementById('product-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleProductSubmit();
        });

        // Formulario de Movimientos
        document.getElementById('movement-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleMovementSubmit();
        });
    },

    /**
     * Cambia entre las diferentes vistas del sistema.
     */
    navigateTo(view) {
        switch (view) {
            case 'dashboard': UI.renderDashboard(); break;
            case 'products': UI.renderProducts(); break;
            case 'movements': UI.renderMovements(); break;
            case 'alerts': UI.renderAlerts(); break;
            case 'reports': UI.renderReports(); break;
        }
    },

    // --- Lógica de Productos ---
    handleProductSubmit() {
        const id = document.getElementById('prod-id').value;
        const productData = {
            name: document.getElementById('prod-name').value,
            category: document.getElementById('prod-category').value,
            price: parseFloat(document.getElementById('prod-price').value),
            stock: parseInt(document.getElementById('prod-stock').value),
            minStock: parseInt(document.getElementById('prod-min-stock').value)
        };

        if (id) {
            Storage.updateProduct(id, productData);
        } else {
            Storage.addProduct(productData);
        }

        UI.closeModal('product-modal');
        UI.renderProducts();
    },

    editProduct(id) {
        UI.showProductModal(id);
    },

    deleteProduct(id) {
        if (confirm('¿Está seguro de eliminar este producto?')) {
            Storage.deleteProduct(id);
            UI.renderProducts();
        }
    },

    handleSearch(query) {
        UI.renderProducts(query);
    },

    // --- Lógica de Movimientos ---
    handleMovementSubmit() {
        const productId = document.getElementById('mov-product').value;
        const type = document.getElementById('mov-type').value;
        const quantity = parseInt(document.getElementById('mov-quantity').value);
        const person = document.getElementById('mov-person').value;

        // Validar stock suficiente para salidas
        if (type === 'salida') {
            const product = Storage.getProductById(productId);
            if (product.stock < quantity) {
                alert('Error: Stock insuficiente para realizar esta salida.');
                return;
            }
        }

        Storage.addMovement({
            productId,
            type,
            quantity,
            personInCharge: person
        });

        UI.closeModal('movement-modal');
        this.navigateTo('movements');
    },

    // --- Utilidades ---
    exportCSV() {
        const products = Storage.getProducts();
        let csv = 'ID,Nombre,Categoria,Stock,Precio,Valor Total\n';
        
        products.forEach(p => {
            csv += `${p.id},${p.name},${p.category},${p.stock},${p.price},${(p.stock * p.price).toFixed(2)}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `reporte_inventario_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

// Iniciar app al cargar el DOM
document.addEventListener('DOMContentLoaded', () => App.init());
