const express = require('express')
const rotasClientes = express()
const clientes = require('../controladores/clientes')
const { validarToken } = require('../filtros/validarToken')

rotasClientes.use(validarToken)

//Cadastrar cliente
rotasClientes.post('/cliente', clientes.cadastrar);
//Listar clientes
rotasClientes.get('/cliente', clientes.listar);
//Detalhar cliente
rotasClientes.get('/cliente/:id', clientes.detalhar);
//Editar Dados do cliente
rotasClientes.put('/cliente/:id', clientes.editarDados);



module.exports = rotasClientes
