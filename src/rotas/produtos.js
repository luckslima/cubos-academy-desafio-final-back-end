const express = require('express')
const rotasProdutos = express()
const produtos = require('../controladores/produtos')
const { validarToken } = require('../filtros/validarToken')

rotasProdutos.use(validarToken)

//Cadastrar Produto
rotasProdutos.post('/produto', produtos.cadastrar)
//Editar Produto
rotasProdutos.put('/produto/:id', produtos.editar)
//Listar Produto(s)
rotasProdutos.get('/produto', produtos.listar)
//Detalhar Produto
rotasProdutos.get('/produto/:id', produtos.detalhar)
//Excluir Produto
rotasProdutos.delete('/produto/:id', produtos.deletar)
//fazer Upload da Imagem do Produto
rotasProdutos.post('/upload', produtos.upload)



module.exports = rotasProdutos
