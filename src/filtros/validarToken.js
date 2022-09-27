const jwt = require('jsonwebtoken')
const knex = require('../banco de dados/conexao')

const validarToken = async (req, res, next) => {
  const { authorization } = req.headers

  if (!authorization) {
    return res.status(401).json({ mensagem: 'Faça login!!!' })
  }

  try {
    let token = authorization.replace('Bearer ', '').trim()

    let usuario = jwt.verify(token, process.env.JWT_SECRET)

    let dados = await knex('usuarios').where('id', usuario.id)

    usuario = dados[0]

    if (dados.length === 0) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado.' })
    }

    let { senha: password, ...usuarioSemSenha } = usuario

    req.usuario = usuarioSemSenha

    next()
  } catch (error) {
    return res.status(400).json({ mensagem: error.message })
  }
}

module.exports = {
  validarToken
}
