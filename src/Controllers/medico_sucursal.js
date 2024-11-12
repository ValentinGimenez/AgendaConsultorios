const MedicoSucursal = require('../models/medico_sucursal');

const medicoSucursalController = {
    async getAll(req, res) {
        const medicoSucursales = await MedicoSucursal.findAll();
        res.json(medicoSucursales);
    },
    async getById(req, res) {
        const medicoSucursal = await MedicoSucursal.findById(req.params.id);
        res.json(medicoSucursal);
    },
    async create(req, res) {
        const id = await MedicoSucursal.create(req.body);
        res.json({ id });
    },
    async update(req, res) {
        await MedicoSucursal.update(req.params.id, req.body);
        res.json({ message: 'Médico Sucursal actualizado' });
    },
    async delete(req, res) {
        await MedicoSucursal.delete(req.params.id);
        res.json({ message: 'Médico Sucursal eliminado' });
    }
};

module.exports = medicoSucursalController;
