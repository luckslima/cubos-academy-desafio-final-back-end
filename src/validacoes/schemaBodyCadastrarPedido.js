const yup = require('./config')

const bodyCadastrarPedido = yup.object().shape({
  cliente_id: yup.number().integer().required(),
  observacao: yup.string(),
  pedidos_produtos: yup.array(yup.object().shape({
    produto_id: yup.number().integer().required(),
    quantidade_produto: yup.number().integer().required()
  })).ensure().required()
})

module.exports = bodyCadastrarPedido
