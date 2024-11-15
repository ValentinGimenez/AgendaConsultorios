const Paciente = require('../models/paciente');
const Persona = require("../models/persona");
const ObraSocial = require("../models/obrasocial");

const pacienteController = {
    async getAll(req, res) {
        try {
          const pacientes = await Paciente.findAll(); 
          const pacienteConDatosPersona = [];

          for (const paciente of pacientes) {
            const persona = await Persona.findById(paciente.idPersona);
            const obrasocial = await ObraSocial.findById(paciente.idObraSocial);
            pacienteConDatosPersona.push({
              id: paciente.id,
              nombre: persona.nombre,
              apellido: persona.apellido,
              mail: persona.mail,
              dni: persona.dni,
              telefono: persona.telefono,
              idObraSocial: paciente.idObraSocial,
              nombreObraSocial: obrasocial.nombre,
            });
          }
          return pacienteConDatosPersona;
        } catch (error) {
          console.error("Error al obtener los pacientes:", error);
          throw error;
        }
      },
    async getById(req, res) {
        const paciente = await Paciente.findById(req.params.id);
        res.json(paciente);
    },
    async create(req, res) {
        const id = await Paciente.create(req.body);
        res.json({ id });
    },
    async update(req, res) {
        try {
          const paciente = await Paciente.findById(req.params.id);
          if (!paciente) {
            return res.status(404).json({ error: 'Paciente no encontrado' });
          }
          const { mail, telefono, idObraSocial} = req.body;
          await Paciente.update(paciente.ID,idObraSocial);
          await Persona.update(paciente.idPersona,mail,telefono);
          res.json({ message: "Paciente actualizado" });
        } catch (error) {
          console.error("Error al actualizar al paciente:", error);
          res.status(500).json({ error: "Error al actualizar al paciente" });
        }
    },
    async delete(req, res) {
        await Paciente.delete(req.params.id);
        res.json({ message: 'Paciente eliminado' });
    },
    async obtenerPacienteidPersona(req, res) {
        const paciente = await Paciente.obtenerPacienteidPersona(req.params.id);
        res.json(paciente);
    },
    async obtenerPaciente(pacienteId) {

      try {
        const paciente = await Paciente.findById(pacienteId);
        if (!paciente) {
          return null; 
        }
        
        const persona = await Persona.findById(paciente.idPersona);
        if (!persona) {
          console.error(`No se encontró la persona con ID ${paciente.idPersona} para el paciente con ID ${pacienteId}`);
          return null;
        }
        const obrasocial = await ObraSocial.findById(paciente.idObraSocial);
        if(!obrasocial){
          console.error(`No se encontró la obra social con ID ${paciente.idObraSocial} para el paciente con ID ${pacienteId}`);
          return null;
        }
    
        paciente.nombre = persona.nombre;
        paciente.apellido = persona.apellido;
        paciente.mail = persona.mail;
        paciente.dni = persona.dni;
        paciente.telefono = persona.telefono;
        paciente.obrasocialNombre = obrasocial.nombre;
  
        return paciente; 
      } catch (error) {
        console.error('Error al obtener el Paciente:', error);
        throw error; 
      }
    },
    async crearPaciente(req, res) {
      console.log("Datos recibidos en el servidor:", req.body);
      try {
        const { nombre, apellido, dni, mail, telefono, fotoDni, idObraSocial, idPersona } = req.body;
        const pacienteExistente = await Paciente.findPacienteByDni(dni);
        if (pacienteExistente) {
          return res.status(400).json({ message: "Ya existe un paciente con ese DNI!" });
        }
        const personaExistente = await Persona.findById(idPersona);
        if (personaExistente) {
          const pacienteId = await Paciente.create({
            idPersona: idPersona,
            fotoDni,
            idObraSocial: "10" 
          });
          res.status(201).json({ id: pacienteId, message: "Paciente registrado exitosamente" });
        } else {
          const dniExistente = await Persona.findByDni(dni);
          if (dniExistente) {
            return res.status(400).json({ message: "Ya existe una persona con ese DNI!" });
          }
          const personaId = await Persona.create({
            nombre,
            apellido,
            dni,
            mail,
            telefono,
          });
          const pacienteId = await Paciente.create({
            idPersona: personaId,
            fotoDni,
            idObraSocial
          });
  
          res.status(201).json({ id: pacienteId, message: "Paciente registrado exitosamente" });
        }
      } catch (error) {
        console.error("Error al registrar el Paciente:", error);
        res.status(500).json({ message: "Error al registrar el Paciente" });
      }
    },
      async getAvailablePersons(req, res) {
        try {
          const personas = await Paciente.findAvailablePersons(); 
          return personas;
        } catch (error) {
          console.error("Error al obtener las personas:", error);
          throw error;
        }
      },
};

module.exports = pacienteController;
