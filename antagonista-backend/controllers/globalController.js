import { createRequire } from "module";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const require = createRequire(import.meta.url);
const authConfig = require("../config/auth.json");

export const generateToken = (user = {}) => {
  return jwt.sign(
    { id: user.id, name: user.nome || user.name },
    authConfig.secret,
    { expiresIn: 86400 }
  );
};

export const decoder = (authHeader) => {
  if (!authHeader) throw new Error("Token não fornecido");
  const [scheme, token] = authHeader.split(" ");
  if (scheme !== 'Bearer' || !token) throw new Error("Formato de token inválido");
  return jwt.verify(token, authConfig.secret);
};

export const hashedPassword = async (password) => {
  const saltRounds = Math.floor(Math.random() * (16 - 10 + 1)) + 10;
  return await bcrypt.hash(password, saltRounds);
};

export const displayUser = (user = {}) => {
  return {
    id: user.id,
    cpf: user.cpf,
    name: user.name,
    birthdate: user.birthdate,
    tel: user.tel,
    email: user.email,
    password: undefined,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};
