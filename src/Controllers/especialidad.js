const Especialidad = require('../models/especialidad');

const especialidadController = {
    async getAll(req, res) {
        const especialidades = await Especialidad.findAll();
        res.json(especialidades);
    },
    async getById(req, res) {
        const especialidad = await Especialidad.findById(req.params.id);
        res.json(especialidad);
    },
    async create(req, res) {
        const id = await Especialidad.create(req.body);
        res.json({ id });
    },
    async update(req, res) {
        await Especialidad.update(req.params.id, req.body);
        res.json({ message: 'Especialidad actualizada' });
    },
    async delete(req, res) {
        await Especialidad.delete(req.params.id);
        res.json({ message: 'Especialidad eliminada' });
    }
};

module.exports = especialidadController;
