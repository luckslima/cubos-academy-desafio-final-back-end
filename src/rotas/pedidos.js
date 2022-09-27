const express = require('express')
const rotasPedidos = express()
const pedidos = require('../controladores/pedidos')
const { validarToken } = require('../filtros/validarToken')

rotasPedidos.use(validarToken)

//Cadastrar Pedido
rotasPedidos.post('/pedido', pedidos.cadastrar)
//Listar Pedidos
rotasPedidos.get('/pedido', pedidos.listar)

module.exports = rotasPedidos
