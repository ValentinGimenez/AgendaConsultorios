const Persona = require("../models/persona");

const personaController = {
  async getAll(req, res) {
    try {
      const personas = await Persona.findAll(); 
      res.json(personas);
    } catch (error) {
      console.error("Error al obtener las personas:", error);
      res.status(500).json({ message: "Error al obtener las personas" });
    }
  },
  async getById(req, res) {
    try {
      const id = req.params.id;
      const persona = await Persona.findById(id);
      if (persona) {
        res.json(persona);
      } else {
        res.status(404).json({ message: "Persona no encontrada" });
      }
    } catch (error) {
      console.error("Error al obtener la persona:", error);
      res.status(500).json({ message: "Error al obtener la persona" });
    }
  },
  async crearPersona(req, res) {
    try {
      const { nombre, apellido, dni, mail, telefono } = req.body;

      if (!nombre || !apellido || !dni || !mail || !telefono) {
        return res
          .status(400)
          .json({ error: "Todos los campos son obligatorios." });
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(mail)) {
        return res
          .status(400)
          .json({ error: "Por favor ingresa un email válido." });
      }

      if (!/^\d{8}$/.test(dni)) {
        return res
          .status(400)
          .json({ error: "El DNI debe contener 8 dígitos." });
      }

      const persona = await Persona.create({
        nombre,
        apellido,
        dni,
        mail,
        telefono,
      });
      res
        .status(201)
        .json({ id: persona, message: "Persona creada exitosamente" });
    } catch (error) {
      console.error("Error al crear persona:", error);
      res.status(500).json({ error: "Error al crear persona" });
    }
  },
  async update(req, res) {
    await Persona.update(req.params.id, req.body);
    res.json({ message: "Persona actualizada" });
  },
  async delete(req, res) {
    await Persona.delete(req.params.id);
    res.json({ message: "Persona eliminada" });
  },
  async findByDni(req, res) {
    const persona=await Persona.findByDni(req.params.dni);
    res.json(persona);
  }

};

module.exports = personaController;
