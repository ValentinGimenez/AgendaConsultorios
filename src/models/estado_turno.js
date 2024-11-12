const pool = require('./db');

const EstadoTurno = {
    async findAll() {
        const [rows] = await pool.query('SELECT * FROM estadoturno'); 
        return rows;
    },
    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM estadoturno WHERE id = ?', [id]); 
        return rows[0];
    },
    async create(data) {
        const { estado } = data;
        const result = await pool.query('INSERT INTO estadoturno (estado) VALUES (?)', [estado]); 
        return result[0].insertId;
    },
    async update(id, data) {
        const { estado } = data;
        await pool.query('UPDATE estadoturno SET estado = ? WHERE id = ?', [estado, id]); 
    },
    async delete(id) {
        await pool.query('DELETE FROM estadoturno WHERE id = ?', [id]); 
    }
};

module.exports = EstadoTurno;