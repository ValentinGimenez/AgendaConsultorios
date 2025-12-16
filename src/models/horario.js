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
    },
    async obtenerAgendaHorarios(data){
        const {idMedico, diasSemana} = data;
        const dias = diasSemana.map(()=> '?').join(',');
        const [rows] = await pool.query(`SELECT a.ID, a.dia_semana, h.fecha_inicio, h.fecha_fin, h.hora_inicio, h.hora_fin, h.estado FROM agenda a JOIN horario h ON h.idAgenda = a.ID JOIN medico_especialidad me ON me.ID = a.idEspecialidadMedico WHERE me.idMedico = ? AND a.dia_semana IN (${dias}) AND h.estado = 'libre'`, [idMedico,...diasSemana]);
        return rows;
    }
};

module.exports = Horario;