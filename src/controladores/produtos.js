const knex = require('../banco de dados/conexao')
const bodyCadastrarProduto = require('../validacoes/schemaBodyCadastrarProduto')
const paramsEditarProduto = require('../validacoes/schemaParamsEditarProduto')
const paramsId = require('../validacoes/schemaParamsIdProduto')
const supabase = require('../supabase')
const { v4: uuid } = require('uuid')

const cadastrar = async (req, res) => {
  const { descricao, quantidade_estoque, valor, categoria_id, produto_imagem } =
    req.body

  try {
    await bodyCadastrarProduto.validate(req.body)

    const categoriaEncontrada = await knex('categorias')
      .where('id', categoria_id)
      .first()

    if (!categoriaEncontrada) {
      return res.status(404).json({
        mensagem:
          'A categoria do produto não foi encontrada, insira um id válido!'
      })
    }

    const novoProduto = await knex('produtos')
      .insert({
        descricao,
        quantidade_estoque,
        valor,
        categoria_id,
        produto_imagem
      })
      .returning('*')

    if (novoProduto.length === 0) {
      return res
        .status(400)
        .json({ mensagem: 'Não foi possível cadastrar o produto.' })
    }

    return res.status(201).json({ mensagem: 'Produto cadastrado com sucesso!' })
  } catch (error) {
    return res.status(400).json(error.message)
  }
}

const editar = async (req, res) => {
  const { descricao, quantidade_estoque, valor, categoria_id, produto_imagem } = req.body
  const { id } = req.params

  try {
    await paramsEditarProduto.validate(req.params)

    const produtoEncontrado = await knex('produtos').where('id', id).first()

    if (!produtoEncontrado) {
      return res.status(404).json({
        mensagem: 'O produto não foi encontrado, insira um id válido!'
      })
    }

    await bodyCadastrarProduto.validate(req.body)

    const categoriaEncontrada = await knex('categorias')
      .where('id', categoria_id)
      .first()

    if (!categoriaEncontrada) {
      return res.status(404).json({
        mensagem:
          'A categoria do produto não foi encontrada, insira um id válido!'
      })
    }

    const jaPossuiImagem = await knex('produtos')
      .select('produto_imagem').where('id', id)
      .first()

    if (produto_imagem === null && jaPossuiImagem.produto_imagem) {

      const arrayUrl = jaPossuiImagem.produto_imagem.split('/')
      const imageName = `${arrayUrl[arrayUrl.length - 2]}/${arrayUrl[arrayUrl.length - 1]}`


      const { data, error } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .remove([imageName])

      if (error) {
        return res
          .status(400)
          .json({ mensagem: 'Não foi possivel excluir a imagem do produto no servidor de armazenamento' })
      }

      await knex('produtos').where('id', id).update({
        descricao,
        quantidade_estoque,
        valor,
        categoria_id,
        produto_imagem: null
      })

      return res.status(200).json({ mensagem: 'O produto foi editado com sucesso e excluida a imagem antiga!' });

    }

    if (produto_imagem) {

      if (jaPossuiImagem.produto_imagem == null) {

        await knex('produtos').where('id', id).update({
          descricao,
          quantidade_estoque,
          valor,
          categoria_id,
          produto_imagem
        })

        return res
          .status(201)
          .json({ mensagem: 'O produto foi editado com sucesso, inclusive, com a imagem informada!' })
      } else {

        const arrayUrl = jaPossuiImagem.produto_imagem.split('/')
        const imageName = `${arrayUrl[arrayUrl.length - 2]}/${arrayUrl[arrayUrl.length - 1]}`

        const { data, error } = await supabase.storage
          .from(process.env.SUPABASE_BUCKET)
          .remove([imageName])

        if (error) {
          return res
            .status(400)
            .json({ mensagem: 'Não foi possivel excluir a imagem do produto' })
        }


        await knex('produtos').where('id', id).update({
          descricao,
          quantidade_estoque,
          valor,
          categoria_id,
          produto_imagem
        })

        return res
          .status(201)
          .json({ mensagem: 'O produto foi editado com sucesso, inclusive, ATUALIZAMOS esta nova imagem informada!' })

      }

    }

    await knex('produtos').where('id', id).update({
      descricao,
      quantidade_estoque,
      valor,
      categoria_id
    })

    return res
      .status(200)
      .json({ mensagem: 'O produto foi editado com sucesso!' })
  } catch (error) {
    return res.status(400).json(error.message)
  }
}

const listar = async (req, res) => {
  const { categoria_id } = req.query

  if (categoria_id) {
    const produtosPorCategoria = await knex('produtos').where(
      'categoria_id',
      categoria_id
    )

    if (produtosPorCategoria.length === 0) {
      return res
        .status(200)
        .json({ mensagem: 'Não há produto para a categoria escolhida' })
    }

    return res.status(200).json(produtosPorCategoria)
  }

  const produtos = await knex('produtos').select('*')

  return res.status(200).json(produtos)
}

const detalhar = async (req, res) => {
  const { id } = req.params
  try {
    await paramsId.validate(req.params)

    const produto = await knex('produtos').where({ id }).first()

    if (!produto) {
      return res
        .status(400)
        .json({ mensagem: 'este produto não foi localizado' })
    }

    return res.status(200).json(produto)
  } catch (error) {
    return res.status(500).json(error.message)
  }
}

const deletar = async (req, res) => {
  const { id } = req.params
  try {
    await paramsId.validate(req.params)

    const produto = await knex('produtos').where({ id }).first()

    if (!produto) {
      return res
        .status(400)
        .json({ mensagem: 'este produto não foi localizado' })
    }

    const pedidoProduto = await knex('pedido_produtos')
      .where({ produto_id: id })
      .first()
    if (pedidoProduto) {
      return res
        .status(400)
        .json({
          mensagem:
            'Não foi possivel excluir este produto, pois ele está vinculado a um pedido'
        })
    }

    const produtoParaExcluir = await knex('produtos').del().where({ id })

    if (!produtoParaExcluir) {
      return res
        .status(400)
        .json({ mensagem: 'Não foi possivel excluir este produto' })
    }

    const arrayUrl = produto.produto_imagem.split('/')
    const imageName = `${arrayUrl[arrayUrl.length - 2]}/${arrayUrl[arrayUrl.length - 1]
      }`

    const { data, error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .remove([imageName])

    if (error) {
      return res
        .status(400)
        .json({ mensagem: 'Não foi possivel excluir a imagem do produto' })
    }

    return res.status(200).json({ mensagem: 'Produto excluido com sucesso' })
  } catch (error) {
    return res.status(400).json(error.message)
  }
}

const upload = async (req, res) => {
  const { url_produto } = req.body
  const nome = `imagens/${uuid()}.png`

  if (!url_produto) {
    return res.status(401).json({ mensagem: ' A url da imagem é obrigatório' })
  }

  const buffer = Buffer.from(url_produto, 'base64')

  try {
    const { data, error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .upload(nome, buffer, { contentType: 'image/png' })

    if (error) {
      return res.status(401).json(error.message)
    }

    const { publicURL, error: errorPublicUrl } = supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .getPublicUrl(nome)

    if (errorPublicUrl) {
      return res.status(401).json(error.message)
    }

    return res.status(200).json(publicURL)
  } catch (error) {
    return res.status(400).json(error.message)
  }
}

module.exports = {
  cadastrar,
  editar,
  listar,
  detalhar,
  deletar,
  upload
}
