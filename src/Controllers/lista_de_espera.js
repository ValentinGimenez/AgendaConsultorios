const ListaDeEspera = require('../models/lista_de_espera');

const listaDeEsperaController = {
    async getAll(req, res) {
        const listaDeEspera = await ListaDeEspera.findAll();
        res.json(listaDeEspera);
    },
    async getById(req, res) {
        const item = await ListaDeEspera.findById(req.params.id);
        res.json(item);
    },
    async create(req, res) {
        const id = await ListaDeEspera.create(req.body);
        res.json({ id });
    },
    async update(req, res) {
        await ListaDeEspera.update(req.params.id, req.body);
        res.json({ message: 'Item en lista de espera actualizado' });
    },
    async delete(req, res) {
        await ListaDeEspera.delete(req.params.id);
        res.json({ message: 'Item en lista de espera eliminado' });
    }
};

module.exports = listaDeEsperaController;
