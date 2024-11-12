const Horario = require('../models/horario');

const horarioController = {
    async getAll(req, res) {
        const horarios = await Horario.findAll();
        res.json(horarios);
    },
    async getById(req, res) {
        const horario = await Horario.findById(req.params.id);
        res.json(horario);
    },
    async create(req, res) {
        const id = await Horario.create(req.body);
        res.json({ id });
    },
    async update(req, res) {
        await Horario.update(req.params.id, req.body);
        res.json({ message: 'Horario actualizado' });
    },
    async delete(req, res) {
        await Horario.delete(req.params.id);
        res.json({ message: 'Horario eliminado' });
    },
    async obtenerRango(req, res) {
       const horarios = await Horario.obtenerRango(req.params.id);
       res.json(horarios);
    }
};

module.exports = horarioController;
