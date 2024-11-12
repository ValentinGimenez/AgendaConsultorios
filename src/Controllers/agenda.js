const Agenda = require('../models/agenda');

const agendaController = {
    async getAll(req, res) {
        const agendas = await Agenda.findAll();
        res.json(agendas);
    },
    async getById(req, res) {
        const agenda = await Agenda.findById(req.params.id);
        res.json(agenda);
    },
    async create(req, res) {
        const id = await Agenda.create(req.body);
        res.json({ id });
    },
    async update(req, res) {
        await Agenda.update(req.params.id, req.body);
        res.json({ message: 'Agenda actualizada' });
    },
    async delete(req, res) {
        await Agenda.delete(req.params.id);
        res.json({ message: 'Agenda eliminada' });
    },
    async obtenerAgendas(req, res) {
        const { idMedicoEspecialidad } = req.params;
        const agendas = await Agenda.obtenerAgendas(idMedicoEspecialidad);
        res.json(agendas);
    }

};

module.exports = agendaController;
