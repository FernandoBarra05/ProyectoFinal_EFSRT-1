/**
 * ui.js
 * Módulo para la manipulación del DOM y renderizado de componentes.
 * Encargado de mostrar las tablas, tarjetas y alertas.
 */

const UI = {
    /**
     * Limpia el contenedor principal y cambia el título de la vista.
     */
    initView(title) {
        document.getElementById('view-title').innerText = title;
        document.getElementById('content').innerHTML = '';
        // Cerrar modales si están abiertos
        this.closeModal('product-modal');
        this.closeModal('movement-modal');
    },

    /**
     * Renderiza el Dashboard principal.
     */
    renderDashboard() {
        this.initView('Dashboard Principal');
        const products = Storage.getProducts();
        const movements = Storage.getMovements();
        const alerts = products.filter(p => p.stock <= p.minStock).length;

        const html = `
            <div class="card-grid">
                <div class="card">
                    <h3>Total Productos</h3>
                    <div class="value">${products.length}</div>
                </div>
                <div class="card" style="border-left: 5px solid var(--danger-color);">
                    <h3>Productos en Alerta</h3>
                    <div class="value" style="color: var(--danger-color);">${alerts}</div>
                </div>
                <div class="card">
                    <h3>Movimientos Hoy</h3>
                    <div class="value">${movements.filter(m => m.date === new Date().toISOString().split('T')[0]).length}</div>
                </div>
            </div>
            <div class="table-container">
                <h3>Últimos Movimientos</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Producto</th>
                            <th>Tipo</th>
                            <th>Cant.</th>
                            <th>Responsable</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${movements.slice(-5).reverse().map(m => {
                            const p = Storage.getProductById(m.productId);
                            return `
                                <tr>
                                    <td>${m.date}</td>
                                    <td>${p ? p.name : 'Eliminado'}</td>
                                    <td><span class="badge ${m.type === 'entrada' ? 'badge-success' : 'badge-danger'}">${m.type.toUpperCase()}</span></td>
                                    <td>${m.quantity}</td>
                                    <td>${m.personInCharge}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
        document.getElementById('content').innerHTML = html;
    },

    /**
     * Renderiza el Módulo de Productos.
     */
    renderProducts(filter = '') {
        this.initView('Gestión de Productos');
        let products = Storage.getProducts();
        
        if (filter) {
            products = products.filter(p => 
                p.name.toLowerCase().includes(filter.toLowerCase()) || 
                p.category.toLowerCase().includes(filter.toLowerCase())
            );
        }

        const html = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                <input type="text" id="search-product" placeholder="Buscar por nombre o categoría..." 
                    style="width: 300px; padding: 10px; border-radius: 8px; border: 1px solid var(--gray-light);"
                    value="${filter}" oninput="App.handleSearch(this.value)">
                <button class="btn btn-primary" onclick="UI.showProductModal()">+ Nuevo Producto</button>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Categoría</th>
                            <th>Precio</th>
                            <th>Stock</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${products.map(p => `
                            <tr>
                                <td>${p.name} ${p.stock <= p.minStock ? '⚠️' : ''}</td>
                                <td class="badge badge-success" style="display:inline-block; margin-top:10px;">${p.category}</td>
                                <td>S/ ${p.price.toFixed(2)}</td>
                                <td style="font-weight:bold; color: ${p.stock <= p.minStock ? 'var(--danger-color)' : 'inherit'}">
                                    ${p.stock}
                                </td>
                                <td>
                                    <button class="btn btn-sm" onclick="App.editProduct('${p.id}')">✏️</button>
                                    <button class="btn btn-sm" style="color: var(--danger-color)" onclick="App.deleteProduct('${p.id}')">🗑️</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        document.getElementById('content').innerHTML = html;
    },

    /**
     * Renderiza el Módulo de Movimientos.
     */
    renderMovements() {
        this.initView('Movimientos de Inventario');
        const movements = Storage.getMovements();

        const html = `
            <div style="margin-bottom: 20px;">
                <button class="btn btn-primary" onclick="UI.showMovementModal()">Registrar Entrada/Salida</button>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Producto</th>
                            <th>Tipo</th>
                            <th>Cantidad</th>
                            <th>Responsable</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${movements.map(m => {
                            const p = Storage.getProductById(m.productId);
                            return `
                                <tr>
                                    <td>${m.date}</td>
                                    <td>${p ? p.name : 'Desconocido'}</td>
                                    <td><span class="badge ${m.type === 'entrada' ? 'badge-success' : 'badge-danger'}">${m.type.toUpperCase()}</span></td>
                                    <td>${m.quantity}</td>
                                    <td>${m.personInCharge}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
        document.getElementById('content').innerHTML = html;
    },

    /**
     * Renderiza el Módulo de Alertas.
     */
    renderAlerts() {
        this.initView('Alertas de Stock Mínimo');
        const products = Storage.getProducts().filter(p => p.stock <= p.minStock);

        const html = `
            <div class="table-container">
                <p style="margin-bottom: 20px; color: var(--danger-color); font-weight: 500;">
                    Se encontraron ${products.length} productos con stock igual o inferior al mínimo configurado.
                </p>
                <table>
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Categoría</th>
                            <th>Stock Actual</th>
                            <th>Stock Mínimo</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${products.map(p => `
                            <tr>
                                <td>${p.name}</td>
                                <td>${p.category}</td>
                                <td style="color: var(--danger-color); font-weight: bold;">${p.stock}</td>
                                <td>${p.minStock}</td>
                                <td><span class="badge badge-danger">REABASTECER</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        document.getElementById('content').innerHTML = html;
    },

    /**
     * Renderiza el Módulo de Reportes.
     */
    renderReports() {
        this.initView('Reportes e Inventario');
        const products = Storage.getProducts();

        const html = `
            <div style="margin-bottom: 20px;" class="no-print">
                <button class="btn btn-primary" onclick="window.print()">🖨️ Imprimir Reporte</button>
                <button class="btn" style="margin-left: 10px;" onclick="App.exportCSV()">📥 Descargar CSV</button>
            </div>
            <div class="table-container" id="printable-report">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h2>REPORTE GENERAL DE EXISTENCIAS</h2>
                    <p>Fecha de generación: ${new Date().toLocaleString()}</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Producto</th>
                            <th>Categoría</th>
                            <th>Existencia</th>
                            <th>P. Unitario</th>
                            <th>Valor Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${products.map(p => `
                            <tr>
                                <td>${p.id.substring(0, 5)}</td>
                                <td>${p.name}</td>
                                <td>${p.category}</td>
                                <td>${p.stock}</td>
                                <td>S/ ${p.price.toFixed(2)}</td>
                                <td>S/ ${(p.stock * p.price).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        document.getElementById('content').innerHTML = html;
    },

    // --- Modales ---
    showProductModal(productId = null) {
        const modal = document.getElementById('product-modal');
        const form = document.getElementById('product-form');
        const title = document.getElementById('modal-title');
        
        form.reset();
        document.getElementById('prod-id').value = '';

        if (productId) {
            title.innerText = 'Editar Producto';
            const p = Storage.getProductById(productId);
            document.getElementById('prod-id').value = p.id;
            document.getElementById('prod-name').value = p.name;
            document.getElementById('prod-category').value = p.category;
            document.getElementById('prod-price').value = p.price;
            document.getElementById('prod-stock').value = p.stock;
            document.getElementById('prod-min-stock').value = p.minStock;
        } else {
            title.innerText = 'Nuevo Producto';
        }

        modal.style.display = 'flex';
    },

    showMovementModal() {
        const modal = document.getElementById('movement-modal');
        const select = document.getElementById('mov-product');
        const products = Storage.getProducts();

        select.innerHTML = products.map(p => `
            <option value="${p.id}">${p.name} (Stock: ${p.stock})</option>
        `).join('');

        modal.style.display = 'flex';
    },

    closeModal(id) {
        document.getElementById(id).style.display = 'none';
    }
};
