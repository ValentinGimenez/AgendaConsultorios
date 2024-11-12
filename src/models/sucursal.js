const pool = require('./db');

const Sucursal = {
    async findAll() {
        try {
            const [rows] = await pool.query('SELECT * FROM sucursal'); 
            return rows;
        } catch (error) {
            console.error('Error al obtener todas las sucursales:', error);
            throw error; 
        }
    },
    async findById(id) {
        try {
            const [rows] = await pool.query('SELECT * FROM sucursal WHERE id = ?', [id]); 
            return rows[0];
        } catch (error) {
            console.error('Error al obtener la sucursal por ID:', error);
            throw error; 
        }
    },
    async create(data) {
        try {
            const { nombre, direccion } = data;
            const result = await pool.query('INSERT INTO sucursal (nombre, direccion) VALUES (?, ?)', [nombre, direccion]); 
            return result[0].insertId;
        } catch (error) {
            console.error('Error al crear la sucursal:', error);
            throw error; 
        }
    },
    async update(id, data) {
        try {
            const { nombre, direccion } = data;
            await pool.query('UPDATE sucursal SET nombre = ?, direccion = ? WHERE id = ?', [nombre, direccion, id]); 
        } catch (error) {
            console.error('Error al actualizar la sucursal:', error);
            throw error; 
        }
    },
    async delete(id) {
        try {
            await pool.query('DELETE FROM sucursal WHERE id = ?', [id]); 
        } catch (error) {
            console.error('Error al eliminar la sucursal:', error);
            throw error; 
        }
    }
};

module.exports = Sucursal;