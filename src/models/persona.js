const pool = require("./db");

const Persona = {
  async findAll() {
    try {
      const [rows] = await pool.query("SELECT id, nombre, apellido FROM persona");
      return rows;
    } catch (error) {
      console.error("Error al obtener todas las personas:", error);
      throw error;
    }
  },
  async findById(id) {
    try {
      const [rows] = await pool.query("SELECT * FROM persona WHERE id = ?", [
        id,
      ]);
      return rows[0];
    } catch (error) {
      console.error("Error al obtener la persona por ID:", error);
      throw error;
    }
  },
  async create(data) {
    try {
      const { nombre, apellido, dni, mail, telefono } = data;
      const result = await pool.query(
        "INSERT INTO persona (nombre, apellido, dni, mail, telefono) VALUES (?, ?, ?, ?, ?)",
        [nombre, apellido, dni, mail, telefono]
      );
      return result[0].insertId;
    } catch (error) {
      console.error("Error al crear la persona:", error);
      throw error;
    }
  },
  async update(id, mail,telefono) {
    try {
      await pool.query(
        "UPDATE persona SET mail = ?, telefono = ? WHERE id = ?",
        [mail, telefono, id]
      );
    } catch (error) {
      console.error("Error al actualizar la persona:", error);
      throw error;
    }
  },
  async delete(id) {
    try {
      await pool.query("DELETE FROM persona WHERE id = ?", [id]);
    } catch (error) {
      console.error("Error al eliminar la persona:", error);
      throw error;
    }
  },
  async findByDni(dni) {
    try {
      const [rows] = await pool.query("SELECT * FROM persona WHERE dni = ?", [
        dni,
      ]);
      if (rows.length === 0) {
        return null;
      }
      return rows[0];
    } catch (error) {
      console.error("Error al buscar la persona por DNI:", error);
      throw error;
    }
  },
  async updatePersona(id, mail,telefono) {
    try {
        await pool.query('UPDATE persona SET mail = ?, telefono = ? WHERE id = ?', [mail, telefono, id]);
    } catch (error) {
        console.error('Error al actualizar la persona:', error);
        throw error;
    }
    },
};

module.exports = Persona;
