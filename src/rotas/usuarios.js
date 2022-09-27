const express = require('express')
const rotasUsuarios = express()
const usuarios = require('../controladores/usuarios')
const { validarToken } = require('../filtros/validarToken')


//Redefinir Senha
rotasUsuarios.patch('/usuario/redefinir', usuarios.redefinirSenha)
//Cadastrar usuário
rotasUsuarios.post('/usuario', usuarios.cadastrar)
//Login do usuário
rotasUsuarios.post('/login', usuarios.login)
//Detalhar usuário
rotasUsuarios.get('/usuario', validarToken, usuarios.detalhar)
//Atualizar usuário
rotasUsuarios.put('/usuario', validarToken, usuarios.atualizar)



module.exports = rotasUsuarios
