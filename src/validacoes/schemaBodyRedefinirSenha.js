const yup = require('./config')

const bodyRedefinirSenha = yup.object().shape({
  email: yup.string().required().email(),
  senha_antiga: yup.string().required(),
  senha_nova: yup.string().required()
})

module.exports = bodyRedefinirSenha
