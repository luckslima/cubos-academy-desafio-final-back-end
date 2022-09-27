const knex = require('../banco de dados/conexao')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {
  validarEmailUnico,
  validarEmailCadastrado
} = require('../validacoes/helpers')
const bodyCadastro = require('../validacoes/schemaBodyCadastro')
const bodyLogin = require('../validacoes/schemaBodyLogin')
const bodyRedefinirSenha = require('../validacoes/schemaBodyRedefinirSenha')
const nodemailer = require('../../nodemailer')

const cadastrar = async (req, res) => {
  const { nome, email, senha } = req.body

  try {
    await bodyCadastro.validate(req.body)

    const emailUnicoValidado = await validarEmailUnico(email)

    if (emailUnicoValidado !== 'OK') {
      return res.status(400).json({ mensagem: emailUnicoValidado })
    }

    const hash = await bcrypt.hash(senha, 10)

    const novoUsuario = await knex('usuarios')
      .insert({
        nome: nome,
        email: email,
        senha: hash
      })
      .returning('*')

    if (novoUsuario.length === 0) {
      return res
        .status(400)
        .json({ mensagem: 'Não foi possível cadastrar o usuário.' })
    }

    const idCadastrado = await knex('usuarios')
      .select('id')
      .where('email', email)

    const usuarioCadastrado = {
      id: idCadastrado[0].id,
      nome,
      email
    }

    return res.status(201).json(usuarioCadastrado)
  } catch (error) {
    return res.status(400).json(error.message)
  }
}

const login = async (req, res) => {
  const { email, senha } = req.body

  try {
    await bodyLogin.validate(req.body)

    const emailCadastrado = await validarEmailCadastrado(email)

    if (emailCadastrado !== 'OK') {
      return res.status(400).json({ mensagem: emailCadastrado })
    }
  } catch (error) {
    return res.status(400).json({ mensagem: error.message })
  }

  try {
    const usuarioEncontrado = await knex('usuarios').where('email', email)

    if (usuarioEncontrado.length === 0) {
      return res.status(404).json({ mensagem: 'Usuário não encontrato!' })
    }

    let usuario = usuarioEncontrado[0]

    const result = await bcrypt.compare(senha, usuario.senha)

    if (!result) {
      return res
        .status(400)
        .json({ mensagem: 'O e-mail ou senha estão incorretos.' })
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1h'
      }
    )

    usuario = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email
    }

    return res.status(200).json({ usuario, token })
  } catch (error) {
    return res.status(400).json(error.message)
  }
}

const detalhar = async (req, res) => {
  const { usuario } = req

  if (usuario.length) {
    return res.status(401).json({
      mensagem:
        'Para acessar este recurso um token de autenticação válido deve ser enviado.'
    })
  }

  try {
    let usuarioEncontrado = await knex('usuarios')
      .where('email', usuario.email)
      .first()
    delete usuarioEncontrado.senha

    return res.status(200).json(usuarioEncontrado)
  } catch (error) {
    return res.status(400).json({ mensagem: error.message })
  }
}
const atualizar = async (req, res) => {
  const { usuario } = req
  const { nome, email, senha } = req.body

  try {
    await bodyCadastro.validate(req.body)

    let usuarioExistente = await knex('usuarios').where('email', email).first()

    if (usuario && usuario.id !== usuarioExistente.id) {
      return res.status(403).json({
        mensagem:
          'O e-mail informado já está sendo utilizado por outro usuário.'
      })
    }

    if (usuario.length) {
      return res.status(401).json({
        mensagem:
          'Para acessar este recurso um token de autenticação válido deve ser enviado.'
      })
    }

    const usuarioEncontrado = await knex('usuarios')
      .where('email', usuario.email)
      .first()

    if (!usuarioEncontrado) {
      return res
        .status(401)
        .json({ mensagem: 'Este usuário não foi localizado' })
    }

    if (nome) {
      usuarioEncontrado.nome = nome
    }

    if (email) {
      usuarioEncontrado.email = email
    }

    if (senha) {
      usuarioEncontrado.senha = await bcrypt.hash(senha, 10)
    }

    await knex('usuarios')
      .where('email', usuario.email)
      .update(usuarioEncontrado)

    return res.status(200).json({ mensagem: 'Usuário atualizado com sucesso!' })
  } catch (error) {
    return res.status(400).json(error.message)
  }
}

const redefinirSenha = async (req, res) => {
  const { email, senha_antiga, senha_nova } = req.body

  try {
    await bodyRedefinirSenha.validate(req.body)

    const usuarioEncontrado = await knex('usuarios').where('email', email)

    let usuario = usuarioEncontrado[0]

    const resultado = await bcrypt.compare(senha_antiga, usuario.senha)

    if (!usuario || !resultado) {
      return res.status(404).json({ mensagem: 'Email ou senha incorretos.' })
    }

    const senha_nova_hash = await bcrypt.hash(senha_nova, 10)

    await knex('usuarios')
      .where('email', email)
      .update('senha', senha_nova_hash)

    const dadosEnvio = {
      from: 'Market Kilian <nao-responder@kiliandev.com.br>',
      to: email,
      subject: 'Dados Alterados - Pdv Kilian',
      text: `Olá ${usuario.nome}, Sua senha foi alterada na plataforma Pdv ${usuario.email}`
    }
    nodemailer.sendMail(dadosEnvio)

    return res.status(200).json({ mensagem: 'Senha atualizada com sucesso!' })
  } catch (error) {
    return res.status(400).json({ mensagem: error.message })
  }
}

module.exports = {
  cadastrar,
  login,
  detalhar,
  atualizar,
  redefinirSenha
}
