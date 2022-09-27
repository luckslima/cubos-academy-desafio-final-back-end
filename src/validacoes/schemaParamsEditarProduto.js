const yup = require('./config')

const paramsEditarProduto = yup.object().shape({
  id: yup.number().integer().required()
})

module.exports = paramsEditarProduto
