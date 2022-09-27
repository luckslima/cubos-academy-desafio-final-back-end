const yup = require('./config')

const bodyCadastrarProduto = yup.object().shape({
  descricao: yup.string().required(),
  quantidade_estoque: yup.number().positive().integer().required(),
  valor: yup.number().positive().integer().required(),
  categoria_id: yup.number().integer().required(),
  produto_imagem: yup.string().url().nullable()
})

module.exports = bodyCadastrarProduto
