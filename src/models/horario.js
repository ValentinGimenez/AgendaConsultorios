const pool = require('./db');

const Horario = {
    async findAll() {
        const [rows] = await pool.query('SELECT * FROM horario'); 
        return rows;
    },
    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM horario WHERE id = ?', [id]); 
        return rows[0];
    },
    async create(data) {
        const { idAgenda, hora_inicio, hora_fin, fecha_inicio, fecha_fin, estado } = data;
        const result = await pool.query('INSERT INTO horario (idAgenda, hora_inicio, hora_fin, fecha_inicio, fecha_fin, estado) VALUES (?, ?,?,?, ?, ?)', [idAgenda, hora_inicio, hora_fin, fecha_inicio, fecha_fin, estado]); 
        return result[0].insertId;
    },
    async update(id, data) {
        const { idAgenda, hora_fin, hora_inicio, fecha_inicio, fecha_fin, estado } = data;
        await pool.query('UPDATE horario SET idAgenda = ?, horaInicio = ?, horaFin = ?, fecha_inicio = ?, fecha_fin = ?, estado=? WHERE id = ?', [idAgenda, hora_inicio, hora_fin,  fecha_inicio, fecha_fin,id, estado]);
    },
    async delete(id) {
        await pool.query('DELETE FROM horario WHERE id = ?', [id]); 
    },
    async obtenerRango(id){
        const [rows] = await pool.query('SELECT hora_inicio, hora_fin FROM horario WHERE idAgenda = ?', [id]);
        return rows;
    }
};

module.exports = Horario;