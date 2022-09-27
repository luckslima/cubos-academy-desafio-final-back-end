const knex = require('../banco de dados/conexao')

const bodyCadastroClientes = require('../validacoes/schemaBodyCadastroClientes')
const {
  validarEmailUnicoCliente,
  validarCpfUnicoCliente
} = require('../validacoes/helpers')

const cadastrar = async (req, res) => {
  const { nome, email, cpf } = req.body
  const { usuario } = req

  try {
    await bodyCadastroClientes.validate(req.body)

    const emailJaCadastrado = await validarEmailUnicoCliente(email)

    if (emailJaCadastrado !== 'OK') {
      return res
        .status(400)
        .json({ mensagem: 'Este email ja está sendo utilizado.' })
    }

    const cpfJaExiste = await validarCpfUnicoCliente(cpf)

    if (cpfJaExiste !== 'OK') {
      return res.status(400).json({ mensagem: 'Este cpf ja foi cadastrado' })
    }

    const novoCliente = await knex('clientes')
      .insert({ nome, email, cpf, usuario_id: usuario.id })
      .returning('*')

    if (novoCliente.length === 0) {
      return res
        .status(400)
        .json({ mensagem: 'Não foi possível cadastrar o usuário.' })
    }

    return res.status(201).json(novoCliente)
  } catch (error) {
    return res.status(400).json(error.message)
  }
}

//Listar clientes do usuario logado
const listar = async (req, res) => {
  const { usuario } = req
  try {
    const clientes = await knex('clientes')
      .where('usuario_id', usuario.id)
      .returning('*')

    if (clientes.length === 0) {
      return res
        .status(400)
        .json({ mensagem: 'Não foi possível listar os clientes.' })
    }

    return res.status(200).json(clientes)
  } catch (error) {
    return res.status(400).json(error.message)
  }
}

//Detalhar um unico cliente do usuario logado
const detalhar = async (req, res) => {
  const { usuario } = req
  const { id } = req.params
  try {
    const cliente = await knex('clientes')
      .where({ usuario_id: usuario.id, id })
      .first()

    if (!cliente) {
      return res
        .status(400)
        .json({ mensagem: 'Não foi possível detalhar o cliente.' })
    }

    return res.status(200).json(cliente)
  } catch (error) {
    return res.status(400).json(error.message)
  }
}

//Editar dados de um cliente do usuário logado
const editarDados = async (req, res) => {
  const { usuario } = req;
  const { id } = req.params;
  const { nome, email, cpf } = req.body;

  try {
    await bodyCadastroClientes.validate(req.body);

    const cliente = await knex('clientes')
      .where({ usuario_id: usuario.id, id })
      .first()

    if (!cliente) {
      return res
        .status(400)
        .json({ mensagem: 'Não foi possível localizar o cliente.' })
    }

    let clientePorEmail = await knex('clientes').where('email', email).first()
    let clientePorId = await knex('clientes').where('id', id).first()
    let clientePorCpf = await knex('clientes').where('cpf', cpf).first()

    if (!clientePorId) {
      return res.status(404).json({ mensagem: 'Id nâo encontrado' })
    }

    if (clientePorEmail && clientePorId.id !== clientePorEmail.id) {
      return res.status(403).json({
        mensagem:
          'O e-mail informado já está sendo utilizado por outro cliente.'
      })
    }

    if (clientePorCpf && clientePorId.id !== clientePorCpf.id) {
      return res.status(403).json({
        mensagem:
          'O cpf informado já está sendo utilizado por outro cliente.'
      })
    }

    const clienteAtualizado = await knex('clientes')
      .where('id', id)
      .update({ nome, email, cpf })
      .returning('*')

    if (clienteAtualizado.length === 0) {
      return res
        .status(400)
        .json({ mensagem: 'Não foi possível editar os dados do cliente.' })
    }

    return res.status(200).json(clienteAtualizado)
  } catch (error) {
    return res.status(400).json(error.message)
  }
}

module.exports = {
  cadastrar,
  listar,
  detalhar,
  editarDados
}
