import jwt from 'jsonwebtoken';

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: true,
      message: "Autorização necessária"
    });
  }

  const [scheme, token] = authHeader.split(" ");
  
  if (!token || scheme !== 'Bearer') {
    return res.status(401).json({
      error: true,
      message: "Formato de token inválido (Use: Bearer <token>)"
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      const errorMessage = err.name === 'TokenExpiredError' ? "Token expirado" : "Token inválido";
      return res.status(401).json({
        error: true,
        message: errorMessage
      });
    }
    req.user = { id: decoded.id, name: decoded.name };
    next();
  });
};

export default authenticate;
