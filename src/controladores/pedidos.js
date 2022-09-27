const knex = require('../banco de dados/conexao')
const bodyCadastrarPedido = require('../validacoes/schemaBodyCadastrarPedido')

const cadastrar = async (req, res) => {
  const { cliente_id, observacao, pedido_produtos } = req.body

  try {
    await bodyCadastrarPedido.validate(req.body)

    let clienteExiste = await knex('clientes').where('id', cliente_id).first()

    if (!clienteExiste) {
      return res.status(404).json({ mensagem: 'O cliente não foi localizado.' })
    }

    let valorTotal = 0

    for (let pedido of pedido_produtos) {
      let produtoEncontrado = await knex('produtos')
        .where('id', pedido.produto_id)
        .first()

      if (!produtoEncontrado) {
        return res
          .status(404)
          .json({ mensagem: 'O produto não foi localizado.' })
      }

      let quantidadeEstoque = await knex('produtos')
        .select('quantidade_estoque')
        .where('id', pedido.produto_id)
        .first()

      if (pedido.quantidade_produto > quantidadeEstoque.quantidade_estoque) {
        return res.status(401).json({
          mensagem: `A quantidade em estoque é de ${quantidadeEstoque.quantidade_estoque}, não sendo assim suficiente para atender a quantidade solicitada.`
        })
      }

      await knex('produtos')
        .where('id', pedido.produto_id)
        .update({
          quantidade_estoque: quantidadeEstoque.quantidade_estoque - pedido.quantidade_produto
        })

      let valorProduto = await knex('produtos')
        .select('valor')
        .where('id', pedido.produto_id)
        .first()

      valorTotal += valorProduto.valor * pedido.quantidade_produto
    }

    let novoPedido = {
      cliente_id,
      observacao,
      valor_total: valorTotal
    }

    const pedidoCadastrado = await knex('pedidos')
      .insert(novoPedido)
      .returning('*')

    if (pedidoCadastrado.length === 0) {
      return res
        .status(400)
        .json({ mensagem: 'Não foi possível cadastrar o pedido.' })
    }

    for (let pedido of pedido_produtos) {
      let valorProduto = await knex('produtos')
        .select('valor')
        .where('id', pedido.produto_id)
        .first()

      let produtoDoPedido = {
        pedido_id: pedidoCadastrado[0].id,
        produto_id: pedido.produto_id,
        quantidade_produto: pedido.quantidade_produto,
        valor_produto: valorProduto.valor
      }

      await knex('pedido_produtos').insert(produtoDoPedido)
    }

    return res.status(201).json(pedidoCadastrado[0])
  } catch (error) {
    return res.status(400).json(error.message)
  }
}
const listar = async (req, res) => {
  const { cliente_id } = req.query

  try {
    if (cliente_id) {
      let clienteExiste = await knex('clientes').where('id', cliente_id).first()

      if (!clienteExiste) {
        return res
          .status(404)
          .json({ mensagem: 'O cliente não foi localizado.' })
      }

      let pedidos = await knex('pedidos')
        .where('cliente_id', cliente_id)
        .select('id', 'cliente_id', 'observacao', 'valor_total')

      for (let pedido of pedidos) {
        pedido.pedido_produtos = await knex('pedido_produtos')
          .where('pedido_id', pedido.id)
          .select('id', 'pedido_id', 'produto_id', 'quantidade_produto', 'valor_produto')
      }

      return res.status(200).json(pedidos)
    }

    let pedidos = await knex('pedidos').select('id', 'cliente_id', 'observacao', 'valor_total')

    for (let pedido of pedidos) {
      pedido.pedido_produtos = await knex('pedido_produtos')
        .where('pedido_id', pedido.id)
        .select('id', 'pedido_id', 'produto_id', 'quantidade_produto', 'valor_produto')
    }

    return res.status(200).json(pedidos)
  } catch (error) {
    return res.status(400).json(error.message)
  }
}


module.exports = {
  cadastrar,
  listar
}
