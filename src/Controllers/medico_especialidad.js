const MedicoEspecialidad = require('../models/medico_especialidad');

const medicoEspecialidadController = {
    async getAll(req, res) {
        const medicoEspecialidades = await MedicoEspecialidad.findAll();
        res.json(medicoEspecialidades);
    },
    async getById(req, res) {
        const medicoEspecialidad = await MedicoEspecialidad.findById(req.params.id);
        res.json(medicoEspecialidad);
    },
    async create(req, res) {
        const id = await MedicoEspecialidad.create(req.body);
        res.json({ id });
    },
    async update(req, res) {
        await MedicoEspecialidad.update(req.params.id, req.body);
        res.json({ message: 'Medico Especialidad actualizado' });
    },
    async delete(req, res) {
        await MedicoEspecialidad.delete(req.params.id);
        res.json({ message: 'Medico Especialidad eliminado' });
    },
    async obtenerEspecialidad(req, res) {
        const medicoEspecialidad = await MedicoEspecialidad.obtenerEspecialidad(req.params.id);
        res.json(medicoEspecialidad);
    },
    async obtenerMedicos(req, res) {
        const medicoEspecialidad = await MedicoEspecialidad.obtenerMedicos(req.params.id);
        res.json(medicoEspecialidad);
    },
    async obtenerTodosMedicos(req, res) {
        const medicos = await MedicoEspecialidad.obtenerTodosMedicos();
        res.json(medicos);
    },
    async obtenerTodasEspecialidades(req, res) {
        const especialidades = await MedicoEspecialidad.obtenerTodasEspecialidades();
        res.json(especialidades);
    },
    async obtenerid(req, res) {
        const { idMedico, idEspecialidad } = req.params;
        const medicoEspecialidad = await MedicoEspecialidad.obtenerid({ idMedico, idEspecialidad });
        res.json(medicoEspecialidad);
    },
    async obtenerEspecialidades(req, res) {
        try {
          const medicoId = req.params.id; // Obtener el ID del médico de la solicitud
          const especialidades = await MedicoEspecialidad.obtenerEspecialidad(medicoId);
          res.json(especialidades);
        } catch (error) {
          console.error('Error al obtener las especialidades del médico:', error);
          res.status(500).json({ error: 'Error al obtener las especialidades del médico' });
        }
      },
      async agregarEspecialidad(req, res) {
        try {
          const { matricula } = req.body;
          const medicoId = req.params.id;
          const especialidadId = req.params.especialidadId;
          await MedicoEspecialidad.agregarEspecialidad(medicoId, especialidadId, matricula);
          res.json({ message: 'Especialidad agregada' });
        } catch (error) {
          console.error('Error al agregar especialidad al médico:', error);
          res.status(500).json({ error: 'Error al agregar especialidad al médico' });
        }
      },
      async quitarEspecialidad(req, res) {
        try {
          console.log('Contenido de req:', req);
          const medicoId = req.params.id;
          const especialidadId = req.params.especialidadId;
          await MedicoEspecialidad.quitarEspecialidad(medicoId, especialidadId);
          res.json({ message: "Especialidad eliminada con exito" });
        } catch (error) {
          console.error('Error al quitar especialidad del médico en el controller:', error);
          res.status(500).json({ error: 'Error al quitar especialidad del médico' });
        }
      },
};

module.exports = medicoEspecialidadController;
