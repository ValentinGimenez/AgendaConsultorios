const DiaNoLaborales = require('../models/dia_no_laborales');

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
      console.error(err);
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
      const dias = await DiaNoLaborales.findAll();
      res.render('admin/dias-no-laborales', { dias });
    } catch (err) {
      console.error('Error al obtener días no laborables:', err);
      res.status(500).render('error', { error: 'Error al obtener días no laborables' });
    }
  }
};

module.exports = diaNoLaboralesController;
