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
        const { idMedico_especialidad, idSucursal } = data;
        const result = await pool.query('INSERT INTO agenda (idEspecialidadMedico, idSucursal) VALUES (?, ?)', [idMedico_especialidad, idSucursal]);
        return result[0].insertId;
    },
    async update(id, data) {
        const { idMedico_especialidad, idSucursal } = data;
        await pool.query('UPDATE agenda SET idEspecialidadMedico = ?, idSucursal = ? WHERE id = ?', [idMedico_especialidad, idSucursal, id]);
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
    },
     async activas() {
        const [rows] = await pool.query(' SELECT a.ID AS idAgenda, a.estado AS estadoAgenda, a.idSucursal AS idSucursal, s.nombre AS sucursalNombre, s.direccion       AS sucursalDireccion, me.ID             AS idMedicoEspecialidad,  m.ID  AS idMedico,  CONCAT(p.apellido, " ", p.nombre) AS medicoNombre,  e.ID AS idEspecialidad,  e.nombre AS especialidadNombre FROM agenda a JOIN sucursal s ON s.ID = a.idSucursal JOIN medico_especialidad me ON me.ID = a.idEspecialidadMedico JOIN medico m ON m.ID = me.idMedico JOIN persona p ON p.ID = m.idPersona JOIN especialidad e ON e.ID = me.idEspecialidad WHERE a.estado = 1 AND m.estado = "activo";' );
        return rows;
    },
    async crearAgendaConHorarios(data) {
        const conn = await pool.getConnection();
        try {
            const {
                idMedico_especialidad,
                idSucursal,
                fecha_inicio,
                fecha_fin,
                hora_inicio,
                hora_fin,
                duracionTurno,
                sobreTurnoMax,
                semana
            } = data;

            await conn.beginTransaction();

            // reutilizar agenda o crear
            const [exist] = await conn.query(
                `SELECT ID FROM agenda WHERE idEspecialidadMedico = ? AND idSucursal = ? LIMIT 1`,
                [idMedico_especialidad, idSucursal]
            );

            let idAgenda;
            if (exist.length) {
                idAgenda = exist[0].ID;
            } else {
                const [insAgenda] = await conn.query(
                    `INSERT INTO agenda (idEspecialidadMedico, idSucursal) VALUES (?, ?)`,
                    [idMedico_especialidad, idSucursal]
                );
                idAgenda = insAgenda.insertId;
            }

            for (const dia of semana) {
                const [ya] = await conn.query(
                    `SELECT 1 FROM horario
                WHERE idAgenda=? AND dia_semana=? AND fecha_inicio=? AND fecha_fin=?
                AND hora_inicio=? AND hora_fin=? AND estado='activo'
                LIMIT 1`,
                    [idAgenda, dia, fecha_inicio, fecha_fin, hora_inicio, hora_fin]
                );
                if (ya.length) continue;

                await conn.query(
                    `INSERT INTO horario
                (idAgenda,dia_semana,fecha_inicio,fecha_fin,hora_inicio,hora_fin,duracionTurno,sobreturnoMax,estado)
                VALUES (?,?,?,?,?,?,?,?, 'activo')`,
                    [idAgenda, dia, fecha_inicio, fecha_fin, hora_inicio, hora_fin, duracionTurno, sobreTurnoMax]
                );

                await conn.query(
                    `CALL generarTurnos(?, ?, ?, ?, ?, ?, ?)`,
                    [idAgenda, hora_inicio, hora_fin, fecha_inicio, fecha_fin, dia, duracionTurno]
                    //idAgenda, hora_inicio, hora_fin, fecha_inicio, fecha_fin, diaSemana, duracionTurno
                );
            }

            await conn.commit();
            return { idAgenda };

        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    }
};

module.exports = Agenda;