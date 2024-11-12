const ObraSocial = require('../models/obrasocial');

const obraSocialController = {
    async getAll(req, res) {
        const obrasSociales = await ObraSocial.findAll();
        res.json(obrasSociales);
    },
    async getById(req, res) {
        const obraSocial = await ObraSocial.findById(req.params.id);
        res.json(obraSocial);
    },
    async create(req, res) {
        const id = await ObraSocial.create(req.body);
        res.json({ id });
    },
    async update(req, res) {
        await ObraSocial.update(req.params.id, req.body);
        res.json({ message: 'Obra Social actualizada' });
    },
    async delete(req, res) {
        await ObraSocial.delete(req.params.id);
        res.json({ message: 'Obra Social eliminada' });
    }
};

module.exports = obraSocialController;
