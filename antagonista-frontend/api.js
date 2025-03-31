// Módulo para centralizar as chamadas para a API
const API_BASE = '/api/v1';

async function request(endpoint, method = 'GET', data, token) {
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (token) {
    config.headers['Authorization'] = 'Bearer ' + token;
  }

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(API_BASE + endpoint, config);
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Erro na requisição');
  }
  return result;
}

// Endpoints de Autenticação
export const loginUser = (email, password) =>
  request('/auth/login', 'POST', { email, password });

export const loginAdmin = (email, password) =>
  request('/auth/admin/login', 'POST', { email, password });

export const registerUser = (cpf, name, birthdate, tel, email, password) =>
  request('/auth/register', 'POST', { cpf, name, birthdate, tel, email, password });

// Endpoints de Perfil
export const getUserProfile = (token) =>
  request('/users/me', 'GET', null, token);

export const updateUserProfile = (token, data) =>
  request('/users/me', 'PUT', data, token);

export const updateUserPassword = (token, password) =>
  request('/users/me/password', 'PUT', { password }, token);

// Endpoints de Produtos
export const getProducts = (params = {}) => {
  // Converte objeto params em query string
  const query = new URLSearchParams(params).toString();
  return request('/global/products?' + query, 'GET');
};

export const getProductDetails = (productId) =>
  request(`/global/products/${productId}`, 'GET');

// Endpoints de Categorias
export const getCategories = () =>
  request('/global/categories', 'GET');

// Endpoints de Pedidos (Checkout e Histórico)
export const createOrder = (token, orderData) =>
  request('/orders', 'POST', orderData, token);

export const getUserOrders = (token) =>
  request('/orders', 'GET', null, token);

// Outros endpoints (ex.: para endereços, atualizações de carrinho no backend, etc.)
export const createAddress = (token, addressData) =>
  request('/addresses', 'POST', addressData, token);

export const getAddresses = (token) =>
  request('/addresses', 'GET', null, token);

export const updateAddress = (token, addressId, addressData) =>
  request(`/addresses/${addressId}`, 'PUT', addressData, token);

export const deleteAddress = (token, addressId) =>
  request(`/addresses/${addressId}`, 'DELETE', null, token);

// Exporta todas as funções para uso global
export default {
  loginUser,
  loginAdmin,
  registerUser,
  getUserProfile,
  updateUserProfile,
  updateUserPassword,
  getProducts,
  getProductDetails,
  getCategories,
  createOrder,
  getUserOrders,
  createAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
};

// Importa o módulo API (caso esteja usando bundler ou script type="module")
// import API from './api.js';

class CartManager {
  constructor() {
    this.cart = JSON.parse(localStorage.getItem('cart')) || [];
    this.updateCartDisplay();
  }

  addItem(product) {
    // Verifica se o produto já existe no carrinho e atualiza a quantidade
    const index = this.cart.findIndex(item => item.id === product.id);
    if (index !== -1) {
      this.cart[index].quantity += product.quantity;
    } else {
      this.cart.push(product);
    }
    this.saveCart();
    this.updateCartDisplay();
  }

  removeItem(productId) {
    this.cart = this.cart.filter(item => item.id !== productId);
    this.saveCart();
    this.updateCartDisplay();
  }

  saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.cart));
  }

  updateCartDisplay() {
    const container = document.getElementById('cartItemsContainer');
    if (!container) return;
    container.innerHTML = '';
    let subtotal = 0;
    this.cart.forEach(item => {
      subtotal += item.price * item.quantity;
      const div = document.createElement('div');
      div.classList.add('cart-item');
      div.innerHTML = `
        <img src="${item.image}" alt="${item.name}" width="50">
        <span>${item.name}</span>
        <span>Qtd: ${item.quantity}</span>
        <span>R$${(item.price * item.quantity).toFixed(2)}</span>
        <button onclick="CartManager.removeItemGlobal('${item.id}')">Remover</button>
      `;
      container.appendChild(div);
    });
    document.getElementById('subtotal').innerText = `R$${subtotal.toFixed(2)}`;
    // Exemplo fixo de frete; implemente cálculo real conforme necessário
    const shipping = subtotal > 0 ? 10.00 : 0.00;
    document.getElementById('shipping').innerText = `R$${shipping.toFixed(2)}`;
    document.getElementById('total').innerText = `R$${(subtotal + shipping).toFixed(2)}`;
  }

  async checkout() {
    if (this.cart.length === 0) {
      alert('Seu carrinho está vazio!');
      return;
    }

    const orderData = {
      items: this.cart.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
      // Inclua outros dados necessários, como endereço ou informações do pagamento
    };

    try {
      // Supondo que você tenha um token armazenado após login
      const token = localStorage.getItem('authToken');
      const result = await fetch('/api/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify(orderData),
      });
      const responseData = await result.json();
      if (!result.ok) {
        throw new Error(responseData.message || 'Erro ao finalizar o pedido');
      }
      alert(responseData.message || 'Pedido finalizado com sucesso!');
      this.cart = [];
      this.saveCart();
      this.updateCartDisplay();
      // Redireciona para a página de confirmação ou pedidos
      window.location.href = 'confirmacao.html';
    } catch (error) {
      alert('Erro no checkout: ' + error.message);
    }
  }

  // Método estático para remoção inline
  static removeItemGlobal(productId) {
    const cm = new CartManager();
    cm.removeItem(productId);
  }
}

// Expor para o escopo global
window.CartManager = CartManager;
window.toggleMenu = function() {
  const menuItems = document.getElementById('MenuItems');
  menuItems.classList.toggle('active');
};
