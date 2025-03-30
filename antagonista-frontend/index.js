// --------------------
// Função de Menu Toggle
// --------------------
function toggleMenu() {
  const menu = document.getElementById("MenuItems");
  if (!menu.style.maxHeight || menu.style.maxHeight === "0px") {
    menu.style.maxHeight = "200px";
  } else {
    menu.style.maxHeight = "0px";
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Menu toggle
  const menuIcon = document.querySelector(".menu-icon");
  if (menuIcon) {
    menuIcon.addEventListener("click", toggleMenu);
  }

  // Inicializações condicionais
  if (document.getElementById('productsContainer')) {
    loadProducts();
  }

  if (document.getElementById('productDetails')) {
    loadProductDetails();
  }

  if (document.getElementById('cartItemsContainer')) {
    new CartManager();
  }
});

// --------------------
// Carregar Produtos (All Products)
// --------------------
async function loadProducts() {
  try {
    const response = await fetch('http://localhost:5000/api/products');
    const products = await response.json();
    const container = document.getElementById('productsContainer');
    if (!container) return;
    
    container.innerHTML = products.map(product => `
      <div class="col-4">
        <a href="product-details.html?id=${product.id}">
          <img src="${product.imageUrl}" alt="${product.name}">
          <h4>${product.name}</h4>
          <div class="ratings">
            <i class="bi bi-star-fill"></i>
            <i class="bi bi-star-fill"></i>
            <i class="bi bi-star-fill"></i>
            <i class="bi bi-star-fill"></i>
            <i class="bi bi-star-fill"></i>
          </div>
          <p>R$${product.price.toFixed(2)}</p>
        </a>
      </div>
    `).join('');
  } catch (error) {
    console.error('Erro ao carregar produtos:', error);
  }
}

// --------------------
// Carregar Detalhes do Produto (Product Details)
// --------------------
async function loadProductDetails() {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');
  if (!productId) return;
  
  try {
    const response = await fetch(`http://localhost:5000/api/products/${productId}`);
    const product = await response.json();
    const container = document.getElementById('productDetails');
    if (!container) return;
    
    container.innerHTML = `
      <div class="row">
        <div class="col-2">
          <img src="${product.imageUrl}" alt="${product.name}" width="100%" id="ProductImg">
          <div class="small-img-row">
            <div class="small-img-col">
              <img src="${product.imageUrl}" alt="${product.name}" width="100%" class="small-img">
            </div>
            <!-- Adicione outras imagens se disponíveis -->
          </div>
        </div>
        <div class="col-2">
          <p>Início / ${product.category || 'Produto'}</p>
          <h1>${product.name}</h1>
          <h4>R$${product.price.toFixed(2)}</h4>
          <select id="sizeSelect">
            <option>Selecionar tamanho</option>
            <option>PP</option>
            <option>P</option>
            <option>M</option>
            <option>G</option>
            <option>GG</option>
            <option>XGG</option>
          </select>
          <input type="number" value="1" id="quantity">
          <button class="btn" onclick="addToCart(${product.id})">Adicionar ao carrinho</button>
          <h3>Detalhes do produto <i class="bi bi-indent"></i></h3>
          <br>
          <p>${product.description || 'Descrição do produto'}</p>
        </div>
      </div>
    `;
    
    // Troca de imagem ao clicar nas miniaturas
    const ProductImg = document.getElementById("ProductImg");
    const smallImgs = document.getElementsByClassName("small-img");
    Array.from(smallImgs).forEach(img => {
      img.onclick = function() {
        ProductImg.src = this.src;
      }
    });
  } catch (error) {
    console.error('Erro ao carregar detalhes do produto:', error);
  }
}

// --------------------
// Gerenciamento do Carrinho
// --------------------
class CartManager {
  constructor() {
    this.cartItems = [];
    this.apiBase = 'http://localhost:5000/api';
    this.loadCart();
  }
  
  async loadCart() {
    const token = localStorage.getItem('authToken');
    if (!token) {
      window.location.href = 'login.html';
      return;
    }
    
    try {
      const response = await fetch(`${this.apiBase}/cart/mycart`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Erro ao carregar carrinho');
      const cart = await response.json();
      this.cartItems = cart.items || [];
      this.renderCart();
      this.calculateTotals();
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
      alert('Erro ao carregar carrinho');
    }
  }
  
  renderCart() {
    const container = document.getElementById('cartItemsContainer');
    if (!container) return;
    container.innerHTML = this.cartItems.map(item => `
      <div class="cart-item">
        <div class="cart-info">
          <img src="${item.product.imageUrl}" alt="${item.product.name}">
          <div>
            <p>${item.product.name}</p>
            <small>Preço: R$${item.product.price.toFixed(2)}</small>
            <br>
            <a href="#" onclick="removeCartItem(${item.id})">Remover</a>
          </div>
        </div>
        <input type="number" value="${item.quantity}" min="1" onchange="updateCartQuantity(${item.id}, this.value)">
        <span>R$${(item.product.price * item.quantity).toFixed(2)}</span>
      </div>
    `).join('');
  }
  
  calculateTotals() {
    const subtotal = this.cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const shipping = subtotal > 200 ? 0 : 15;
    const total = subtotal + shipping;
    
    document.getElementById('subtotal').textContent = `R$${subtotal.toFixed(2)}`;
    document.getElementById('shipping').textContent = `R$${shipping.toFixed(2)}`;
    document.getElementById('total').textContent = `R$${total.toFixed(2)}`;
  }
  
  async checkout() {
    const token = localStorage.getItem('authToken');
    let totalText = document.getElementById('total').textContent.replace('R$', '');
    totalText = totalText.replace(',', '.');
    const amount = parseFloat(totalText) * 100;
    try {
      const response = await fetch(`${this.apiBase}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount, currency: 'brl', paymentMethodId: 'pm_card_visa' })
      });
      const result = await response.json();
      if (result.success) {
        window.location.href = 'pedido-sucesso.html';
      } else {
        alert('Erro no pagamento');
      }
    } catch (error) {
      console.error('Erro no checkout:', error);
      alert('Erro ao processar pagamento');
    }
  }
}

// Funções globais para carrinho
async function updateCartQuantity(itemId, newQuantity) {
  const token = localStorage.getItem('authToken');
  try {
    const response = await fetch(`http://localhost:5000/api/cart/items/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ quantity: parseInt(newQuantity) })
    });
    if (response.ok) new CartManager().loadCart();
  } catch (error) {
    console.error('Erro ao atualizar quantidade:', error);
  }
}

async function removeCartItem(itemId) {
  const token = localStorage.getItem('authToken');
  try {
    const response = await fetch(`http://localhost:5000/api/cart/items/${itemId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) new CartManager().loadCart();
  } catch (error) {
    console.error('Erro ao remover item:', error);
  }
}

// Adiciona produto ao carrinho (usado na página de detalhes)
async function addToCart(productId) {
  const quantity = parseInt(document.getElementById('quantity').value);
  const token = localStorage.getItem('authToken');
  if (!token) {
    alert('Você precisa estar logado para adicionar ao carrinho.');
    window.location.href = 'login.html';
    return;
  }
  
  try {
    const response = await fetch('http://localhost:5000/api/cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ productId, quantity })
    });
    const result = await response.json();
    if (result) {
      alert('Produto adicionado ao carrinho');
    }
  } catch (error) {
    console.error('Erro ao adicionar ao carrinho:', error);
  }
}
