// --------------------
// Configurações Globais
// --------------------
const elements = {
  // Elementos do Header/Menu
  menuItems: document.getElementById("MenuItems"),
  menuIcon: document.querySelector(".menu-icon"),
  
  // Elementos de Produtos
  productsContainer: document.getElementById("productsContainer"),
  productDetails: document.getElementById("productDetails"),
  
  // Elementos do Carrinho
  cartItemsContainer: document.getElementById("cartItemsContainer"),
  cartTemplates: {
    product: document.getElementById("product-template"),
    cartItem: document.getElementById("cart-item-template")
  },
  
  // Elementos de Feedback
  loadingSpinner: document.getElementById("loading-spinner"),
  errorContainer: document.getElementById("error-container")
};

const API_BASE = 'http://localhost:5000/api';

// --------------------
// Helpers
// --------------------
function showLoading() {
  if (elements.loadingSpinner) elements.loadingSpinner.style.display = 'block';
}

function hideLoading() {
  if (elements.loadingSpinner) elements.loadingSpinner.style.display = 'none';
}

function showError(message) {
  if (elements.errorContainer) {
    elements.errorContainer.textContent = message;
    elements.errorContainer.style.display = 'block';
  }
}

// --------------------
// Menu Toggle (Melhorado com ARIA)
// --------------------
function toggleMenu() {
  const isExpanded = elements.menuItems.getAttribute('aria-expanded') === 'true';
  elements.menuItems.setAttribute('aria-expanded', !isExpanded);
  elements.menuItems.style.maxHeight = isExpanded ? '0px' : '200px';
}

// --------------------
// Sistema de Produtos (Com Cache Local)
// --------------------
class ProductManager {
  constructor() {
    this.cachedProducts = JSON.parse(localStorage.getItem('products')) || [];
  }

  async loadProducts() {
    try {
      showLoading();
      
      // Usar cache se disponível
      if (this.cachedProducts.length) {
        this.renderProducts(this.cachedProducts);
      }

      const response = await fetch(`${API_BASE}/products`);
      const products = await response.json();
      
      // Atualizar cache
      localStorage.setItem('products', JSON.stringify(products));
      this.renderProducts(products);
      
    } catch (error) {
      showError('Erro ao carregar produtos. Tentando cache...');
      this.renderProducts(this.cachedProducts);
    } finally {
      hideLoading();
    }
  }

  renderProducts(products) {
    if (!elements.productsContainer) return;
    
    elements.productsContainer.innerHTML = '';
    products.forEach(product => {
      const clone = elements.cartTemplates.product.content.cloneNode(true);
      const link = clone.querySelector('a');
      
      link.href = `product-details.html?id=${product.id}`;
      clone.querySelector('img').src = product.imageUrl;
      clone.querySelector('h4').textContent = product.name;
      clone.querySelector('p').textContent = `R$${product.price.toFixed(2)}`;
      
      elements.productsContainer.appendChild(clone);
    });
  }

  async loadProductDetails() {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');
    if (!productId) return;

    try {
      showLoading();
      const response = await fetch(`${API_BASE}/products/${productId}`);
      const product = await response.json();
      this.renderProductDetails(product);
    } catch (error) {
      showError('Produto não encontrado!');
    } finally {
      hideLoading();
    }
  }

  renderProductDetails(product) {
    if (!elements.productDetails) return;
    
    const clone = elements.cartTemplates.product.content.cloneNode(true);
    const details = clone.querySelector('.product-details');
    
    details.querySelector('h1').textContent = product.name;
    details.querySelector('img').src = product.imageUrl;
    details.querySelector('h4').textContent = `R$${product.price.toFixed(2)}`;
    details.querySelector('p').textContent = product.description;
    
    // Configurar eventos
    details.querySelector('button').addEventListener('click', () => 
      this.addToCart(product.id));
    
    elements.productDetails.appendChild(clone);
  }
}

// --------------------
// Sistema de Carrinho (Com LocalStorage Fallback)
// --------------------
class CartManager {
  constructor() {
    this.cart = JSON.parse(localStorage.getItem('cart')) || [];
    this.init();
  }

  async init() {
    try {
      await this.syncWithServer();
    } catch (error) {
      console.error('Usando carrinho offline:', error);
    }
    this.render();
  }

  async syncWithServer() {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    const response = await fetch(`${API_BASE}/cart/mycart`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    this.cart = await response.json().items || [];
    localStorage.setItem('cart', JSON.stringify(this.cart));
  }

  render() {
    if (!elements.cartItemsContainer) return;
    
    elements.cartItemsContainer.innerHTML = '';
    this.cart.forEach(item => {
      const clone = elements.cartTemplates.cartItem.content.cloneNode(true);
      const cartItem = clone.querySelector('.cart-item');
      
      cartItem.querySelector('img').src = item.product.imageUrl;
      cartItem.querySelector('p').textContent = item.product.name;
      cartItem.querySelector('input').value = item.quantity;
      cartItem.querySelector('span').textContent = 
        `R$${(item.product.price * item.quantity).toFixed(2)}`;
      
      cartItem.querySelector('.delete-btn').addEventListener('click', () => 
        this.removeItem(item.id));
      
      cartItem.querySelector('input').addEventListener('change', (e) => 
        this.updateQuantity(item.id, e.target.value));
      
      elements.cartItemsContainer.appendChild(clone);
    });
    
    this.calculateTotals();
  }

  calculateTotals() {
    const subtotal = this.cart.reduce((sum, item) => 
      sum + (item.product.price * item.quantity), 0);
    
    document.getElementById('subtotal').textContent = `R$${subtotal.toFixed(2)}`;
    document.getElementById('total').textContent = 
      `R$${(subtotal + 15).toFixed(2)}`; // Frete fixo exemplo
  }

  async addToCart(productId) {
    try {
      const existingItem = this.cart.find(item => item.product.id === productId);
      const quantity = existingItem ? existingItem.quantity + 1 : 1;

      if (existingItem) {
        await this.updateQuantity(existingItem.id, quantity);
      } else {
        const response = await fetch(`${API_BASE}/cart`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({ productId, quantity })
        });
        
        const newItem = await response.json();
        this.cart.push(newItem);
        this.render();
      }
      
      localStorage.setItem('cart', JSON.stringify(this.cart));
    } catch (error) {
      showError('Erro ao adicionar ao carrinho');
    }
  }

  async updateQuantity(itemId, newQuantity) {
    // Implementação similar ao exemplo anterior
  }

  async removeItem(itemId) {
    // Implementação similar ao exemplo anterior
  }
}

// --------------------
// Inicialização do Sistema
// --------------------
document.addEventListener('DOMContentLoaded', () => {
  // Menu
  if (elements.menuIcon) {
    elements.menuIcon.addEventListener('click', toggleMenu);
  }

  // Produtos
  const productManager = new ProductManager();
  if (elements.productsContainer) productManager.loadProducts();
  if (elements.productDetails) productManager.loadProductDetails();

  // Carrinho
  if (elements.cartItemsContainer) new CartManager();
});

// --------------------
// Funções Globais
// --------------------
window.addToCart = async (productId) => {
  try {
    await new CartManager().addToCart(productId);
    alert('Produto adicionado com sucesso!');
  } catch (error) {
    showError('Faça login para adicionar produtos!');
  }
};