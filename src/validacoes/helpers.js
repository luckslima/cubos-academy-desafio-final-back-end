const knex = require('../banco de dados/conexao')

const validarEmailUnico = async email => {
  try {
    const emailUnico = await knex('usuarios').where('email', email)

    if (emailUnico.length !== 0) {
      return 'Já consta usuário com e-mail cadastrado.'
    }
  } catch (error) {
    return error.message
  }
  return 'OK'
}

const validarEmailCadastrado = async email => {
  try {
    const usuarioBancoDeDados = await knex('usuarios')
      .where('email', email)
      .first()

    if (!usuarioBancoDeDados) {
      return 'O e-mail ou senha estão incorretos.'
    }
  } catch (error) {
    return error.message
  }
  return 'OK'
}

const validarEmailUnicoCliente = async email => {
  try {
    const emailUnico = await knex('clientes').where('email', email)

    if (emailUnico.length !== 0) {
      return 'Já consta usuário com e-mail cadastrado.'
    }
  } catch (error) {
    return error.message
  }
  return 'OK'
}

const validarCpfUnicoCliente = async cpf => {
  try {
    const cpfUnico = await knex('clientes').where('cpf', cpf)

    if (cpfUnico.length !== 0) {
      return 'Já consta usuário com este cpf cadastrado.'
    }
  } catch (error) {
    return error.message
  }
  return 'OK'
}


module.exports = {
  validarEmailUnico,
  validarEmailCadastrado,
  validarEmailUnicoCliente,
  validarCpfUnicoCliente
}
