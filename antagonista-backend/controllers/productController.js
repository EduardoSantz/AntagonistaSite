import { prisma } from '../config/prismaClient.js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { rimraf } from 'rimraf';

// Helpers
const generateSKU = async () => {
  const lastProduct = await prisma.product.findFirst({
    orderBy: { sku: 'desc' },
  });
  
  let skuNumber = 1;
  if (lastProduct?.sku) {
    // Aqui usamos base 10 para converter o número após a letra "P"
    const lastSKU = parseInt(lastProduct.sku.slice(1), 10);
    skuNumber = lastSKU + 1;
  }
  
  return `P${skuNumber.toString().padStart(4, '0')}`;
};

const handleFileUpload = async (files, sku) => {
  const uploadPath = `uploads/produtos/${sku}`;
  fs.mkdirSync(uploadPath, { recursive: true });

  return Promise.all(files.map(async (file) => {
    const ext = path.extname(file.originalname);
    const filename = `${sku}_${uuidv4()}${ext}`;
    const filePath = path.join(uploadPath, filename);
    
    await fs.promises.rename(file.path, filePath);
    
    return {
      src: filePath,
      url: `/imagens/${sku}/${filename}`,
    };
  }));
};

// Controllers
export const createProduct = async (req, res) => {
  try {
    const { body, files } = req;
    const requiredFields = ['nome', 'preco', 'categoriaId', 'disponivel'];
    
    // Validação
    const missingFields = requiredFields.filter(field => !body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: true,
        message: `Campos obrigatórios: ${missingFields.join(', ')}`
      });
    }

    // Geração de SKU
    const sku = await generateSKU();
    
    // Upload de imagens
    let fotos = [];
    if (files?.length) {
      fotos = await handleFileUpload(files, sku);
    }

    // Criação do produto
    const product = await prisma.product.create({
      data: {
        sku,
        nome: body.nome,
        preco: parseFloat(body.preco),
        precoPromocional: body.precoPromocional ? parseFloat(body.precoPromocional) : null,
        disponivel: body.disponivel === 'true' || body.disponivel === true,
        atributos: body.atributos ? JSON.parse(body.atributos) : {},
        categoria: { connect: { id: body.categoriaId } },
        fotos: { create: fotos },
      },
      include: { fotos: true, categoria: true }
    });

    // Lógica de ofertas
    if (body.ofertaId) {
      await prisma.featuredProduct.upsert({
        where: { productId: product.id },
        update: {},
        create: {
          offer: body.ofertaNome,
          product: { connect: { id: product.id } }
        }
      });
    }

    return res.status(201).json({
      message: 'Produto criado com sucesso',
      data: product
    });

  } catch (error) {
    return res.status(500).json({
      error: true,
      message: 'Erro ao criar produto',
      details: error.message
    });
  }
};

export const getProducts = async (req, res) => {
  try {
    const { limit = 10, offset = 0, categoria, oferta } = req.query;
    
    const products = await prisma.product.findMany({
      skip: parseInt(offset),
      take: parseInt(limit),
      where: {
        ...(categoria && { categoriaId: categoria }),
        ...(oferta && { featuredProducts: { some: { offer: oferta } } })
      },
      include: {
        fotos: true,
        categoria: true,
        featuredProducts: true
      }
    });

    return res.json({ data: products });

  } catch (error) {
    return res.status(500).json({
      error: true,
      message: 'Erro ao buscar produtos',
      details: error.message
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.productId },
      include: {
        fotos: true,
        categoria: true,
        featuredProducts: true
      }
    });

    if (!product) {
      return res.status(404).json({
        error: true,
        message: 'Produto não encontrado'
      });
    }

    return res.json({ data: product });

  } catch (error) {
    return res.status(500).json({
      error: true,
      message: 'Erro ao buscar produto',
      details: error.message
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { body, files } = req;
    const productId = req.params.productId;

    // Obter produto existente
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: { fotos: true }
    });

    if (!existingProduct) {
      return res.status(404).json({
        error: true,
        message: 'Produto não encontrado'
      });
    }

    // Atualizar imagens, se houver novas
    let fotos = existingProduct.fotos;
    if (files?.length) {
      const newPhotos = await handleFileUpload(files, existingProduct.sku);
      fotos = [...fotos, ...newPhotos];
    }

    // Atualizar dados
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        nome: body.nome,
        preco: parseFloat(body.preco),
        precoPromocional: body.precoPromocional ? parseFloat(body.precoPromocional) : null,
        disponivel: body.disponivel === 'true' || body.disponivel === true,
        atributos: body.atributos ? JSON.parse(body.atributos) : existingProduct.atributos,
        ...(body.categoriaId && { categoria: { connect: { id: body.categoriaId } } }),
        fotos: { set: fotos },
      },
      include: { fotos: true, categoria: true }
    });

    return res.json({
      message: 'Produto atualizado com sucesso',
      data: updatedProduct
    });

  } catch (error) {
    return res.status(500).json({
      error: true,
      message: 'Erro ao atualizar produto',
      details: error.message
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.productId;

    // Obter produto para excluir arquivos
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({
        error: true,
        message: 'Produto não encontrado'
      });
    }

    // Excluir arquivos
    const uploadPath = `uploads/produtos/${product.sku}`;
    if (fs.existsSync(uploadPath)) {
      rimraf.sync(uploadPath);
    }

    // Excluir do banco
    await prisma.product.delete({
      where: { id: productId }
    });

    return res.json({ message: 'Produto excluído com sucesso' });

  } catch (error) {
    return res.status(500).json({
      error: true,
      message: 'Erro ao excluir produto',
      details: error.message
    });
  }
};
