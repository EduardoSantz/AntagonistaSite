export const validateUserInput = (req, res, next) => {
    const { cpf, name, birthdate, email, password } = req.body;
    if (!cpf || !name || !birthdate || !email || !password) {
      return res.status(400).json({ error: true, message: 'Campos obrigatórios não preenchidos' });
    }
    next();
  };
  
  export const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: true, message: 'Email e senha são obrigatórios' });
    }
    next();
  };
  
  export const validateObjectId = (req, res, next) => {
    // Esta validação pode ser aprimorada conforme o padrão dos IDs (UUIDs, por exemplo)
    const id = req.params.id || req.params.adminId || req.params.categoryId || req.params.productId || req.params.orderId || req.params.addressId;
    if (!id) {
      return res.status(400).json({ error: true, message: 'ID inválido' });
    }
    next();
  };
  
  export const validateAddressInput = (req, res, next) => {
    const { street, city, state, zip, country } = req.body;
    if (!street || !city || !state || !zip || !country) {
      return res.status(400).json({ error: true, message: 'Campos de endereço são obrigatórios' });
    }
    next();
  };
  
  export const validateOrderItems = (req, res, next) => {
    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: true, message: 'Itens do pedido são obrigatórios' });
    }
    next();
  };
  