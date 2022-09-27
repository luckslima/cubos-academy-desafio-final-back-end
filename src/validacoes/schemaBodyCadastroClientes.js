const yup = require('./config')

const bodyCadastroCliente = yup.object().shape({
    nome: yup.string().required(),
    email: yup.string().required().email(),
    cpf: yup.string().required().min(9).max(11)
})

module.exports = bodyCadastroCliente