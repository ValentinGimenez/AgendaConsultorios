const DiaNoLaborales = require('../models/dia_no_laborales');
const Sucursal = require("../models/sucursal");
const Medico = require("../models/medico");

const diaNoLaboralesController = {
  async getAll(req, res) {
    const dias = await DiaNoLaborales.findAll();
    res.json(dias);
  },

  async getById(req, res) {
    const dia = await DiaNoLaborales.findById(req.params.id);
    if (!dia) return res.status(404).json({ message: 'Día no laboral no encontrado' });
    res.json(dia);
  },

  async create(req, res) {
    try {
      const id = await DiaNoLaborales.create(req.body);
      res.json({ id, message: 'Día no laboral creado correctamente' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error al crear el día no laboral' });
    }
  },

  async update(req, res) {
    try {
      await DiaNoLaborales.update(req.params.id, req.body);
      res.json({ message: 'Día no laboral actualizado' });
    } catch (err) {
      
      console.error("🔥 update día no laboral ERROR:", err);
  console.error("sqlMessage:", err?.sqlMessage);
  console.error("sqlState:", err?.sqlState);
  console.error("sql:", err?.sql);
      res.status(500).json({ message: 'Error al actualizar el día no laboral' });
    }
  },

  async delete(req, res) {
    try {
      await DiaNoLaborales.delete(req.params.id);
      res.json({ message: 'Día no laboral eliminado' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error al eliminar el día no laboral' });
    }
  },

  async vistaLista(req, res) {
    try {
      const diasAll = await DiaNoLaborales.findAll();
      const medicosAll = await Medico.obtenerMedicos();
      const sucursales = await Sucursal.findAll();
      const medicos = medicosAll.filter(m => m.estado === 'activo');
      const dias = diasAll.filter(m => m.estado === 'activo');


      res.render('admin/dias-no-laborales', { dias, medicos, sucursales});
    } catch (err) {
      console.error('Error al cargar la vista', err);
      res.status(500).render('error', { error: 'Error al cargar la vista' });
    }
  },
  
};


module.exports = diaNoLaboralesController;
