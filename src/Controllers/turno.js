const Turno = require('../models/turno');

const turnoController = {
    async getAll(req, res) {
        const turnos = await Turno.findAll();
        res.json(turnos);
    },
    async getById(req, res) {
        const turno = await Turno.findById(req.params.id);
        res.json(turno);
    },
    async create(req, res) {
        const id = await Turno.create(req.body);
        res.json({ id });
    },
    async update(req, res) {
        await Turno.update(req.params.id, req.body);
        res.json({ message: 'Turno actualizado' });
    },
    async delete(req, res) {
        await Turno.delete(req.params.id);
        res.json({ message: 'Turno eliminado' });
    },
    async turnosLibres(req, res) {
        const turnosLibres = await Turno.turnosLibres(req.params.id);
        res.json(turnosLibres);
    },
    async agendarTurno(req, res) {
       await Turno.agendarTurno(req.params.id, req.body);
        res.json({ message: 'Turno agendado' });
    },
    async generarTurnos(req, res) {
        await Turno.generarTurnos(req.body);
        res.json({ message: 'Turnos generados' });
    }
};

module.exports = turnoController;
