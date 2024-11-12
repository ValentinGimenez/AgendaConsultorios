const pool = require('./db');

const Especialidad = {
    async findAll() {
        try {
            const [rows] = await pool.query('SELECT id,nombre FROM especialidad');
            return rows;
          } catch (error) {
            console.error('Error al obtener las especialidades:', error);
            throw error;
          }
        },
    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM especialidad WHERE id = ?', [id]); 
        return rows[0];
    },
    async create(data) {
        const { nombre } = data;
        const result = await pool.query('INSERT INTO especialidad (nombre) VALUES (?)', [nombre]); 
        return result[0].insertId;
    },
    async update(id, data) {
        const { nombre } = data;
        await pool.query('UPDATE especialidad SET nombre = ? WHERE id = ?', [nombre, id]); 
    },
    async delete(id) {
        await pool.query('DELETE FROM especialidad WHERE id = ?', [id]); 
    }
};

module.exports = Especialidad;