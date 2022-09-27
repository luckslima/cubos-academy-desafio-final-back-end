const knex = require('../banco de dados/conexao')

const listar = async (req, res) => {
    try {

        const categorias = await knex('categorias');

        return res.status(200).json(categorias);

    } catch (error) {

        return res.status(400).json({ message: error.message });

    }
}

module.exports = {
    listar
}
