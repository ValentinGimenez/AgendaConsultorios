const pool = require('./db');

const MedicoSucursal = {
    async findAll() {
        const [rows] = await pool.query('SELECT * FROM medico_sucursal'); 
        return rows;
    },
    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM medico_sucursal WHERE id = ?', [id]); 
        return rows[0];
    },
    async create(data) {
        const { idMedico, idSucursal } = data;
        const result = await pool.query('INSERT INTO medico_sucursal (idMedico, idSucursal) VALUES (?, ?)', [idMedico, idSucursal]);
        return result[0].insertId;
    },
    async update(id, data) {
        const { idMedico, idSucursal } = data;
        await pool.query('UPDATE medico_sucursal SET idMedico = ?, idSucursal = ? WHERE id = ?', [idMedico, idSucursal, id]); 
    },
    async delete(id) {
        await pool.query('DELETE FROM medico_sucursal WHERE id = ?', [id]); 
    }
};

module.exports = MedicoSucursal;