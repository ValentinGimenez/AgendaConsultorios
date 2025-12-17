const pool = require('./db');

const Agenda = {
    async findAll() {
        const [rows] = await pool.query('SELECT * FROM agenda');
        return rows;
    },
    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM agenda WHERE id = ?', [id]);
        return rows[0];
    },
    async create(data) {
        const { idMedico_especialidad, idSucursal, semana,  sobreTurnoMax, duracionTurno } = data;
        const result = await pool.query('INSERT INTO agenda (idEspecialidadMedico, idSucursal, dia_semana, sobreTurnoMax, duracionturno) VALUES (?, ?, ?,?,?)', [idMedico_especialidad, idSucursal, semana, sobreTurnoMax, duracionTurno]);
        return result[0].insertId;
    },
    async update(id, data) {
        const { idMedico_especialidad, idSucursal, semana,  sobreTurnoMax, duracionTurno  } = data;
        await pool.query('UPDATE agenda SET idEspecialidadMedico = ?, idSucursal = ?, dia_semana=?, sobreTurnoMax=?, duracionturno=? WHERE id = ?', [idMedico_especialidad, idSucursal,semana,  sobreTurnoMax, duracionTurno , id]); 
    },
    async delete(id) {
        await pool.query('DELETE FROM agenda WHERE id = ?', [id]);
    },
    async obtenerAgendas(idMedicoEspecialidad) {
        const [rows] = await pool.query(' SELECT a.*,s.nombre AS sucursalNombre,s.direccion   AS sucursalDireccion FROM agenda a JOIN sucursal s ON s.ID = a.idSucursal WHERE a.idEspecialidadMedico = ?', [idMedicoEspecialidad]);
        return rows;
    },
    async obtenerSucursales(idMedicoEspecialidad) {
        const [rows] = await pool.query(
            `
            SELECT DISTINCT s.id, s.nombre, s.direccion
            FROM agenda a
            JOIN sucursal s ON s.id = a.idSucursal
            WHERE a.idEspecialidadMedico = ?
            `,
            [idMedicoEspecialidad]
        );
        return rows;
    },
    async obtenerMedicoEspecialidadPorSucursal(idSucursal) {
        const [rows] = await pool.query(
            `
            SELECT DISTINCT
                me.ID AS idMedicoEspecialidad,
                m.ID AS idMedico,
                e.ID AS idEspecialidad,
                p.nombre AS medicoNombre,
                p.apellido AS medicoApellido,
                e.nombre AS especialidadNombre
            FROM 
                agenda a
            JOIN 
                medico_especialidad me ON me.ID = a.idEspecialidadMedico
            JOIN
                medico m ON m.ID = me.idMedico
            JOIN
                persona p ON p.ID = m.idPersona
            JOIN
                especialidad e ON e.ID = me.idEspecialidad
            WHERE a.idSucursal = ?
            `,
            [idSucursal]
        );
        return rows;
    }
};

module.exports = Agenda;