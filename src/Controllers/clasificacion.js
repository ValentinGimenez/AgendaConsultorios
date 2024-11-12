const Clasificacion = require('../models/clasificacion');

const clasificacionController = {
    async getAll(req, res) {
        const clasificaciones = await Clasificacion.findAll();
        res.json(clasificaciones);
    },
    async getById(req, res) {
        const clasificacion = await Clasificacion.findById(req.params.id);
        res.json(clasificacion);
    },
    async create(req, res) {
        const id = await Clasificacion.create(req.body);
        res.json({ id });
    },
    async update(req, res) {
        await Clasificacion.update(req.params.id, req.body);
        res.json({ message: 'Clasificación actualizada' });
    },
    async delete(req, res) {
        await Clasificacion.delete(req.params.id);
        res.json({ message: 'Clasificación eliminada' });
    }
};

module.exports = clasificacionController;
