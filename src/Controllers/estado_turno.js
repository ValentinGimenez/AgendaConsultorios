const EstadoTurno = require('../models/estado_turno');

const estadoTurnoController = {
    async getAll(req, res) {
        const estadosTurno = await EstadoTurno.findAll();
        res.json(estadosTurno);
    },
    async getById(req, res) {
        const estadoTurno = await EstadoTurno.findById(req.params.id);
        res.json(estadoTurno);
    },
    async create(req, res) {
        const id = await EstadoTurno.create(req.body);
        res.json({ id });
    },
    async update(req, res) {
        await EstadoTurno.update(req.params.id, req.body);
        res.json({ message: 'Estado de turno actualizado' });
    },
    async delete(req, res) {
        await EstadoTurno.delete(req.params.id);
        res.json({ message: 'Estado de turno eliminado' });
    }
};

module.exports = estadoTurnoController;
