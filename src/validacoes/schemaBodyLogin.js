const yup = require('./config')

const bodyLogin = yup.object().shape({
  email: yup.string().required().email(),
  senha: yup.string().required()
})

module.exports = bodyLogin
