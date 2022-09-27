const yup = require('./config')

const bodyCadastro = yup.object().shape({
  nome: yup.string().required(),
  email: yup.string().required().email(),
  senha: yup.string().required()
})

module.exports = bodyCadastro
