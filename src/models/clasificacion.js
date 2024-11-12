const pool = require('./db');

const Clasificacion = {
    async findAll() {
        const [rows] = await pool.query('SELECT * FROM clasificacion');
        return rows;
    },
    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM clasificacion WHERE id = ?', [id]); 
        return rows[0];
    },
    async create(data) {
        const { idAgenda, descripcion } = data;
        const result = await pool.query('INSERT INTO clasificacion (idAgenda, descripcion) VALUES (?, ?)', [idAgenda, descripcion]); 
        return result[0].insertId;
    },
    async update(id, data) {
        const { idAgenda, descripcion } = data;
        await pool.query('UPDATE clasificacion SET idAgenda = ?, descripcion = ? WHERE id = ?', [idAgenda, descripcion, id]); 
    },
    async delete(id) {
        await pool.query('DELETE FROM clasificacion WHERE id = ?', [id]);
    }
};

module.exports = Clasificacion;