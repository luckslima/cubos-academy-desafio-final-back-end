require('dotenv').config()
const express = require('express')
const rotasCategorias = require('./rotas/categorias')
const rotasUsuarios = require('./rotas/usuarios')
const rotasProdutos = require('./rotas/produtos')
const rotasClientes = require('./rotas/clientes')
const rotasPedidos = require('./rotas/pedidos')

const app = express()

app.use(express.json({ limit: '5mb' }))
app.use(rotasUsuarios)
app.use(rotasCategorias)
app.use(rotasProdutos)
app.use(rotasClientes)
app.use(rotasPedidos)


app.listen(process.env.PORT || 3000)
