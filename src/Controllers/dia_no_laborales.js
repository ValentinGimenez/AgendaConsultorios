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

      const accion = req.body.accion_turnos;
      if (accion && accion !== 'NINGUNA') {
        const resultado = await DiaNoLaborales.aplicarAccionTurnos({
          ...req.body,
          bloques: Array.isArray(req.body.bloques) ? req.body.bloques : []
        });
        console.log(`Turnos actualizados: ${resultado.updated}`);
      }

      res.json({ id, message: 'Día no laboral creado correctamente' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error al crear el día no laboral' });
    }
  },

  async update(req, res) {
    try {
      await DiaNoLaborales.update(req.params.id, req.body);

      const accion = req.body.accion_turnos;
      if (accion && accion !== 'NINGUNA') {
        const resultado = await DiaNoLaborales.aplicarAccionTurnos({
          ...req.body,
          bloques: Array.isArray(req.body.bloques) ? req.body.bloques : []
        });
        console.log(`Turnos actualizados: ${resultado.updated}`);
      }

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


      res.render('admin/dias-no-laborales', { dias, medicos, sucursales });
    } catch (err) {
      console.error('Error al cargar la vista', err);
      res.status(500).render('error', { error: 'Error al cargar la vista' });
    }
  },
  async resolverBloquesAusencia(req, res) {
    try {
      const { idMedico, fecha, all_day, hora_inicio, hora_fin } = req.body || {};

      const medicoId = Number(idMedico);
      const allDay = Number(all_day ?? 1);

      if (!Number.isFinite(medicoId) || medicoId <= 0) {
        return res.status(400).json({ message: 'idMedico inválido.' });
      }
      if (!isValidDateYYYYMMDD(fecha)) {
        return res.status(400).json({ message: 'fecha inválida (YYYY-MM-DD).' });
      }

      if (allDay === 0) {
        if (!isValidTimeHHMM(hora_inicio) || !isValidTimeHHMM(hora_fin)) {
          return res.status(400).json({ message: 'hora_inicio/hora_fin inválidas (HH:MM).' });
        }
        if (hora_fin <= hora_inicio) {
          return res.status(400).json({ message: 'hora_fin debe ser mayor a hora_inicio.' });
        }
      }

      const result = await DiaNoLaborales.resolverBloquesAusencia({
        idMedico: medicoId,
        fecha,
        all_day: allDay,
        hora_inicio: allDay === 0 ? hora_inicio.slice(0, 5) : null,
        hora_fin: allDay === 0 ? hora_fin.slice(0, 5) : null
      });

      return res.json(result);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error resolviendo bloques de ausencia.' });
    }
  },
  async aplicarAccionTurnos(req, res) {
    try {
      const payload = req.body || {};

      const {
        tipo,
        alcance,
        fecha_inicio,
        fecha_fin,
        all_day,
        accion_turnos,
        idMedico,
        idSucursal,
        hora_inicio,
        hora_fin,
        bloques
      } = payload;

      if (!tipo || !alcance || !fecha_inicio || !fecha_fin) {
        return res.status(400).json({ message: 'Faltan campos: tipo/alcance/fecha_inicio/fecha_fin.' });
      }

      if (!accion_turnos) {
        return res.status(400).json({ message: 'Falta accion_turnos (ESPERA/CANCELAR/NINGUNA).' });
      }

      if (alcance === 'PROFESIONAL' && !idMedico) {
        return res.status(400).json({ message: 'Falta idMedico para alcance PROFESIONAL.' });
      }

      if (alcance === 'SUCURSAL' && !idSucursal) {
        return res.status(400).json({ message: 'Falta idSucursal para alcance SUCURSAL.' });
      }

      if (Number(all_day) === 0) {
        if (!hora_inicio || !hora_fin || String(hora_fin) <= String(hora_inicio)) {
          return res.status(400).json({ message: 'Rango horario inválido.' });
        }
      }

      const result = await  DiaNoLaborales.aplicarAccionTurnos({
        ...payload,
        bloques: Array.isArray(bloques) ? bloques : []
      });

      return res.json({
        message: 'Acción aplicada correctamente.',
        updated: result.updated || 0
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error aplicando acción a turnos.' });
    }
  },

  async verificarTurnos(req, res) {
    try {
      const {
        tipo,
        alcance,
        idMedico,
        idSucursal,
        fecha_inicio,
        fecha_fin,
        all_day,
        hora_inicio,
        hora_fin,
        bloques,
        excludeDiaId
      } = req.body || {};

      if (!tipo || !alcance || !fecha_inicio || !fecha_fin) {
        return res.status(400).json({ message: 'Faltan campos obligatorios (tipo, alcance, fecha_inicio, fecha_fin).' });
      }

      const data = await DiaNoLaborales.verificarTurnos({
        tipo,
        alcance,
        idMedico: idMedico ? Number(idMedico) : null,
        idSucursal: idSucursal ? Number(idSucursal) : null,
        fecha_inicio,
        fecha_fin,
        all_day: Number(all_day ?? 1),
        hora_inicio: hora_inicio ? String(hora_inicio).slice(0, 5) : null,
        hora_fin: hora_fin ? String(hora_fin).slice(0, 5) : null,
        bloques: Array.isArray(bloques) ? bloques : null,
        excludeDiaId: excludeDiaId ? Number(excludeDiaId) : null
      });

      return res.json(data);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: 'Error verificando turnos.' });
    }
  }

};
function isValidDateYYYYMMDD(s) {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
}
function isValidTimeHHMM(s) {
  return typeof s === 'string' && /^\d{2}:\d{2}(:\d{2})?$/.test(s);
}


module.exports = diaNoLaboralesController;
