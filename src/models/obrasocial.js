const pool = require("./db");

const ObraSocial = {
  async findAll() {
    try {
      const [rows] = await pool.query("SELECT id,nombre FROM obrasocial");
      return rows;
    } catch (error) {
      console.error("Error al obtener todas las obras sociales:", error);
      throw error;
    }
  },
  async findById(id) {
    const [rows] = await pool.query("SELECT id,nombre FROM obrasocial WHERE id = ?", [
      id,
    ]);
    return rows[0];
  },
  async create(data) {
    const { nombre } = data;
    const result = await pool.query(
      "INSERT INTO obrasocial (nombre) VALUES (?)",
      [nombre]
    );
    return result[0].insertId;
  },
  async update(id, data) {
    const { nombre } = data;
    await pool.query("UPDATE obrasocial SET nombre = ? WHERE id = ?", [
      nombre,
      id,
    ]);
  },
  async delete(id) {
    await pool.query("DELETE FROM obrasocial WHERE id = ?", [id]);
  },
};

module.exports = ObraSocial;
