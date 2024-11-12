const pool = require('./db');
const bcrypt = require('bcrypt');

const Usuario = {
    async findAll() {
        try {
            const [rows] = await pool.query('SELECT * FROM usuario');
            return rows;
        } catch (error) {
            console.error('Error al obtener todos los usuarios:', error);
            throw error;
        }
    },
    async findById(id) {
        try {
            const [rows] = await pool.query('SELECT * FROM usuario WHERE id = ?', [id]);
            return rows[0];
        } catch (error) {
            console.error('Error al obtener el usuario por ID:', error);
            throw error;
        }
    },
    async findByNombre(nombre) {
        try {
            const [rows] = await pool.query('SELECT * FROM usuario WHERE nombre = ?', [nombre]);
            return rows[0];
        } catch (error) {
            console.error('Error al obtener el usuario por nombre:', error);
            throw error;
        }
    },
    async create(data) {
        try {
            const { idPersona, nombre, password, tipo } = data;

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            const result = await pool.query('INSERT INTO usuario (idPersona, nombre, password, tipo) VALUES (?, ?, ?, ?)', [idPersona, nombre, hashedPassword, tipo]);
            return result[0].insertId;
        } catch (error) {
            console.error('Error al crear el usuario:', error);
            throw error;
        }
    },
    async update(id, data) {
        try {
            const { idPersona, nombre, password, tipo } = data;

            let hashedPassword = null;
            if (password) {
                const saltRounds = 10;
                hashedPassword = await bcrypt.hash(password, saltRounds);
            }

            await pool.query('UPDATE usuario SET idPersona = ?, nombre = ?, password = ?, tipo = ? WHERE id = ?', [idPersona, nombre, hashedPassword || password, tipo, id]);
        } catch (error) {
            console.error('Error al actualizar el usuario:', error);
            throw error;
        }
    },
    async delete(id) {
        try {
            await pool.query('DELETE FROM usuario WHERE id = ?', [id]);
        } catch (error) {
            console.error('Error al eliminar el usuario:', error);
            throw error;
        }
    }
};

module.exports = Usuario;