const pool = require('./db');

const Ausencia = {
    async findAll() {
        const [rows] = await pool.query('SELECT * FROM ausencia');
        return rows;
    },
    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM ausencia WHERE id = ?', [id]);
        return rows[0];
    },
    async create(data) {
        const { idAgenda, motivo } = data;
        const result = await pool.query('INSERT INTO ausencia (idAgenda, motivo) VALUES (?, ?)', [idAgenda, motivo]);
        return result[0].insertId;
    },
    async update(id, data) {
        const { idAgenda, motivo } = data;
        await pool.query('UPDATE ausencia SET idAgenda = ?, motivo = ? WHERE id = ?', [idAgenda, motivo, id]); 
    },
    async delete(id) {
        await pool.query('DELETE FROM ausencia WHERE id = ?', [id]); 
    }
};

module.exports = Ausencia;