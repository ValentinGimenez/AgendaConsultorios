const DiaNoLaborales = require('../models/dia_no_laborales');

const diaNoLaboralesController = {
    async getAll(req, res) {
        const diasNoLaborales = await DiaNoLaborales.findAll();
        res.json(diasNoLaborales);
    },
    async getById(req, res) {
        const diaNoLaboral = await DiaNoLaborales.findById(req.params.id);
        res.json(diaNoLaboral);
    },
    async create(req, res) {
        const id = await DiaNoLaborales.create(req.body);
        res.json({ id });
    },
    async update(req, res) {
        await DiaNoLaborales.update(req.params.id, req.body);
        res.json({ message: 'Día no laboral actualizado' });
    },
    async delete(req, res) {
        await DiaNoLaborales.delete(req.params.id);
        res.json({ message: 'Día no laboral eliminado' });
    }
};

module.exports = diaNoLaboralesController;
