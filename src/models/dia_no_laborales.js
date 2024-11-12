const pool = require('./db');

const DiaNoLaborales = {
    async findAll() {
        const [rows] = await pool.query('SELECT * FROM dia_no_laborables'); 
        return rows;
    },
    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM dia_no_laborables WHERE id = ?', [id]);
        return rows[0];
    },
    async create(data) {
        const { fecha, descripcion } = data;
        const result = await pool.query('INSERT INTO dia_no_laborables (fecha, descripcion) VALUES (?, ?)', [fecha, descripcion]); 
        return result[0].insertId;
    },
    async update(id, data) {
        const { fecha, descripcion } = data;
        await pool.query('UPDATE dia_no_laborables SET fecha = ?, descripcion = ? WHERE id = ?', [fecha, descripcion, id]); 
    },
    async delete(id) {
        await pool.query('DELETE FROM dia_no_laborables WHERE id = ?', [id]); 
    }
};

module.exports = DiaNoLaborales;