const Medico = require("../models/medico");
const Persona = require("../models/persona");
const MedicoEspecialidad = require('../models/medico_especialidad');
const Especialidad = require('../models/especialidad');
const medicoController = {
  async getAll(req, res) {
    try {
      const medicos = await Medico.findAll(); 
      const medicosConDatosPersona = [];
      for (const medico of medicos) {
        const persona = await Persona.findById(medico.idPersona);
        medicosConDatosPersona.push({
          id: medico.id,
          nombre: persona.nombre,
          apellido: persona.apellido,
          mail: persona.mail,
          dni: persona.dni,
          telefono: persona.telefono,
          estado: medico.estado,
        });
      }
      return medicosConDatosPersona;
    } catch (error) {
      console.error("Error al obtener los médicos:", error);
      throw error;
    }
  },
  async getById(req, res) {
    const medico = await Medico.findById(req.params.id);
    res.json(medico);
  },
  async crearMedico(req, res) {

    try {
      const { nombre, apellido, dni, mail, telefono } = req.body;
      const medicoExistente = await Medico.findMedicoByDni(dni);
      if (medicoExistente) {
        return res.status(400).json({ message: "Ya existe un médico con ese DNI!" });
      }
      const personaId = await Persona.create({
        nombre,
        apellido,
        dni,
        mail,
        telefono,
      });

      const medicoId = await Medico.create({
        idPersona: personaId,
        estado: "inactivo",
      });

      res
        .status(201)
        .json({ id: medicoId, message: "Médico registrado exitosamente" });
    } catch (error) {
      console.error("Error al registrar el médico:", error);
      res.status(500).json({ message: "Error al registrar el médico" });
    }
  },
  async activarMedico(req, res) {
    try {
      const medicoId = req.params.id;
      await Medico.updateEstado(medicoId, { estado: "activo" });
      res.json({ message: "Médico activado" });
    } catch (error) {
      console.error("Error al activar el médico:", error);
      res.status(500).json({ error: "Error al activar el médico" });
    }
  },

  async desactivarMedico(req, res) {
    try {
      const medicoId = req.params.id;
      await Medico.updateEstado(medicoId, { estado: "inactivo" });
      res.json({ message: "Médico desactivado" });
    } catch (error) {
      console.error("Error al desactivar el médico:", error);
      res.status(500).json({ error: "Error al desactivar el médico" });
    }
  },
  async actualizarCorreoTelefono(req, res) {
    try {
      console.log("entre a actuializar");
      const medico = await Medico.findById(req.params.id);
      console.log("medico:",medico);
      if (!medico) {
        return null;
      }
      const { mail, telefono } = req.body;
      await Medico.updatePersona(medico.idPersona,mail,telefono);
      res.json({ message: "Médico actualizado" });
    } catch (error) {
      console.error("Error al actualizar al médico:", error);
      res.status(500).json({ error: "Error al actualizar al médico" });
    }
  },
  async obtenerMedico(medicoId) {
  try {
    const medico = await Medico.findById(medicoId);
    if (!medico) {
      return null; 
    }

    const persona = await Persona.findById(medico.idPersona);
    if (!persona) {
      console.error(`No se encontró la persona con ID ${medico.idPersona} para el médico con ID ${medicoId}`);
      return null;
    }

    medico.nombre = persona.nombre;
    medico.apellido = persona.apellido;
    medico.mail = persona.mail;
    medico.dni = persona.dni;
    medico.telefono = persona.telefono;
    console.log("Medico antes de las especialidades:", medico);

    const especialidades = await MedicoEspecialidad.obtenerEspecialidades(medicoId);
    medico.especialidades = especialidades; 

    console.log("Especialidades del médico en el controlador:", medico.especialidades);
    console.log("Medico despues de las especialidades:", medico);
    
    return medico; 
  } catch (error) {
    console.error('Error al obtener el médico:', error);
    throw error; 
  }
},
  async update(req, res) {
    await Medico.updateEstado(req.params.id, req.body);
    res.json({ message: "Médico actualizado" });
  },
  async delete(req, res) {
    await Medico.delete(req.params.id);
    res.json({ message: "Médico eliminado" });
  },
  async obtenerMedicos(req, res) {
    const medicoEspecialidad = await Medico.obtenerMedicos(req.params.id);
    res.json(medicoEspecialidad);
  },

};

module.exports = medicoController;
