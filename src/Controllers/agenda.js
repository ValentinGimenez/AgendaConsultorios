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
    },
    async obtenerSucursalesPorMedicoEspecialidad(req, res) {
        const { idMedicoEspecialidad } = req.params;
        try {
            const sucursales = await Agenda.obtenerSucursales(idMedicoEspecialidad);
            res.json(sucursales);
        } catch (error) {
            console.error("Error al obtener sucursales por médico-especialidad:", error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },
    async obtenerMedicoEspecialidadPorSucursal(req, res) {
        const { idSucursal } = req.params;
        try {
            const medicosEspecialidades = await Agenda.obtenerMedicoEspecialidadPorSucursal(idSucursal);
            res.json(medicosEspecialidades);
        } catch (error) {
            console.error("Error al obtener médico-especialidad por sucursal:", error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    },
    async activas(req, res) {
        const agendas = await Agenda.activas();
        res.json(agendas);
    },
    async crearAgendaConHorarios(req, res) {
        try {
            const { idMedico_especialidad, idSucursal, semana, sobreTurnoMax } = req.body;

            if (!idMedico_especialidad || !idSucursal)
                return res.status(400).json({ message: 'Faltan datos de agenda.' });

            if (!Array.isArray(semana) || semana.length === 0)
                return res.status(400).json({ message: 'Debe seleccionar al menos un día.' });

            const nSob = Number(sobreTurnoMax);
            if (!Number.isFinite(nSob))
                return res.status(400).json({ message: 'sobreturnoMax inválido.' });

            const r = await Agenda.crearAgendaConHorarios({ ...req.body, sobreTurnoMax: nSob });
            return res.json({ message: 'Agenda, horarios y turnos creados', ...r });

        } catch (err) {
            console.error('crearAgendaConHorarios ERROR:', err);
            return res.status(500).json({ message: 'Error al crear agenda/horarios/turnos' });
        }
    }

};

module.exports = agendaController;
