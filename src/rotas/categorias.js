const express = require('express')
const rotasCategorias = express()
const categorias = require('../controladores/categorias')

//Listar Categorias
rotasCategorias.get('/categoria', categorias.listar)

module.exports = rotasCategorias
