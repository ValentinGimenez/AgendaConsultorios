const Sucursal = require('../models/sucursal');

const sucursalController = {
    async getAll(req, res) {
        const sucursales = await Sucursal.findAll();
        res.json(sucursales);
    },
    async getById(req, res) {
        const sucursal = await Sucursal.findById(req.params.id);
        res.json(sucursal);
    },
    async create(req, res) {
        const id = await Sucursal.create(req.body);
        res.json({ id });
    },
    async update(req, res) {
        await Sucursal.update(req.params.id, req.body);
        res.json({ message: 'Sucursal actualizada' });
    },
    async delete(req, res) {
        await Sucursal.delete(req.params.id);
        res.json({ message: 'Sucursal eliminada' });
    }
};

module.exports = sucursalController;
