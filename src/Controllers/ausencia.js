const Ausencia = require('../models/ausencia');

const ausenciaController = {
    async getAll(req, res) {
        const ausencias = await Ausencia.findAll();
        res.json(ausencias);
    },
    async getById(req, res) {
        const ausencia = await Ausencia.findById(req.params.id);
        res.json(ausencia);
    },
    async create(req, res) {
        const id = await Ausencia.create(req.body);
        res.json({ id });
    },
    async update(req, res) {
        await Ausencia.update(req.params.id, req.body);
        res.json({ message: 'Ausencia actualizada' });
    },
    async delete(req, res) {
        await Ausencia.delete(req.params.id);
        res.json({ message: 'Ausencia eliminada' });
    }
};

module.exports = ausenciaController;
