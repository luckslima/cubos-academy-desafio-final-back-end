const yup = require('./config')

const paramsId = yup.object().shape({
    id: yup.number().integer().required()
})

module.exports = paramsId
