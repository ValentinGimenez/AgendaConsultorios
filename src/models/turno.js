const pool = require('./db');

const Turno = {
    async findAll() {
        try {
            const [rows] = await pool.query('SELECT * FROM turno');
            return rows;
        } catch (error) {
            console.error('Error al obtener todos los turnos:', error);
            throw error;
        }
    },
    async findById(id) {
        try {
            const [rows] = await pool.query('SELECT * FROM turno WHERE id = ?', [id]);
            return rows[0];
        } catch (error) {
            console.error('Error al obtener el turno por ID:', error);
            throw error;
        }
    },
    async create(data) {
        try {
            const { idAgenda, idPaciente, idEstadoTurno, fecha } = data;
            const result = await pool.query('INSERT INTO turno (idAgenda, idPaciente, idEstadoTurno, fecha) VALUES (?, ?, ?, ?)', [idAgenda, idPaciente, idEstadoTurno, fecha]);
            return result[0].insertId;
        } catch (error) {
            console.error('Error al crear el turno:', error);
            throw error;
        }
    },
    async update(id, data) {
        try {
            const { idAgenda, idPaciente, idEstadoTurno, fecha } = data;
            await pool.query('UPDATE turno SET idAgenda = ?, idPaciente = ?, idEstadoTurno = ?, fecha = ? WHERE id = ?', [idAgenda, idPaciente, idEstadoTurno, fecha, id]);
        } catch (error) {
            console.error('Error al actualizar el turno:', error);
            throw error;
        }
    },
    async delete(id) {
        try {
            await pool.query('DELETE FROM turno WHERE id = ?', [id]);
        } catch (error) {
            console.error('Error al eliminar el turno:', error);
            throw error;
        }
    },
    async turnosLibres(id) {
        const [rows] = await pool.query('SELECT  t.ID,  t.fecha,  t.hora_inicio,  t.hora_fin,  a.ID AS idAgenda FROM agenda a JOIN medico_especialidad me ON me.ID = a.idEspecialidadMedico JOIN turno t ON t.idAgenda = a.ID WHERE a.ID= ? AND t.idEstadoTurno = 1 AND (  t.fecha > CURDATE()  OR (t.fecha = CURDATE() AND t.hora_inicio > CURTIME())) ORDER BY t.fecha, t.hora_inicio;', [id]);
        return rows;
    },
    async turnosReservados(id) {
        const [rows] = await pool.query('SELECT * FROM turno WHERE idAgenda = ? AND idEstadoTurno = 2 AND fecha >= CURDATE() AND tipo = "normal"', [id]);
        return rows;
    },
    async agendarTurno(id, data) {
        try {
            const { idPaciente, motivoConsulta } = data;
            await pool.query('UPDATE turno SET idPaciente = ?, idEstadoTurno = 2, tipo= "normal", motivo_consulta = ? WHERE ID = ?', [idPaciente, motivoConsulta, id]);
        } catch (error) {
            console.error('Error al asignar el turno:', error);
            throw error;
        }
    },
    async generarTurnos(data) {
        const { idAgenda, hora_fin, hora_inicio, fecha_inicio, fecha_fin, diaSemana, duracionTurno } = data;
        console.log("data:", data);
        try {
            const [result] = await pool.query('CALL generarTurnos(?,?,?,?,?,?,?)', [
                idAgenda, hora_inicio, hora_fin, fecha_inicio, fecha_fin, diaSemana, duracionTurno
            ]);

            console.log('Resultado de la consulta:', result);
        } catch (error) {
            console.error('Error al llamar al procedimiento:', error);
        }
    },
  async crearSobreturno(idTurno, data) {
    const { idPaciente, motivoConsulta } = data;

    const query = `
        INSERT INTO turno (idAgenda, idPaciente, idEstadoTurno, fecha, hora_inicio, hora_fin, tipo, motivo_consulta)
        SELECT idAgenda, ?, 2, fecha, hora_inicio, hora_fin, 'sobreturno', ?
        FROM turno
        WHERE id = ?;
    `;

    const [result] = await pool.query(query, [idPaciente, motivoConsulta, idTurno]);

    if (result.affectedRows === 0) {
        throw new Error('No se pudo crear el sobreturno: el turno original no existe.');
    }
    
    return result.insertId; 
},
    
    async turnosSinSobreturnoPorAgenda(idAgenda) {
        const [rows] = await pool.query(
            `SELECT * FROM turno t WHERE t.idAgenda = ? AND t.tipo <> 'sobreturno'`, [idAgenda]);
        return rows;
    },
    async sobreturnos(idAgenda){
        const [rows] = await pool.query(
            `SELECT * FROM turno t WHERE t.idAgenda = ? AND t.tipo = 'sobreturno'`, [idAgenda]);
        return rows;
    },
    async obtenerTurnosSecretaria({ fecha, idMedico = null, idEspecialidad = null, idEstadoTurno = null }) {
        try {
            const sql = `
                SELECT
                    t.ID,
                    t.fecha,
                    t.hora_inicio,
                    t.hora_fin,
                    t.idEstadoTurno,
                    et.descripcion AS estado,
                    CONCAT(pm.apellido,' ',pm.nombre) AS medico,
                    e.nombre AS especialidad,
                    CASE
                        WHEN t.idPaciente IS NULL THEN '-'
                        ELSE CONCAT(pp.apellido,' ',pp.nombre)
                    END AS paciente,
                    t.tipo,
                    t.motivo_consulta 
                FROM turno t
                JOIN agenda a ON a.ID = t.idAgenda
                JOIN medico_especialidad me ON me.ID = a.idEspecialidadMedico
                JOIN medico m ON m.ID = me.idMedico
                JOIN persona pm ON pm.ID = m.idPersona
                JOIN especialidad e ON e.ID = me.idEspecialidad
                JOIN estadoturno et ON et.ID = t.idEstadoTurno
                LEFT JOIN paciente pa ON pa.ID = t.idPaciente
                LEFT JOIN persona pp ON pp.ID = pa.idPersona
                WHERE t.fecha = ?
                  AND t.idEstadoTurno != 1
                  AND (? IS NULL OR me.idMedico = ?)
                  AND (? IS NULL OR me.idEspecialidad = ?)
                  AND (? IS NULL OR t.idEstadoTurno = ?)
                ORDER BY t.hora_inicio;
            `;
            const params = [fecha, idMedico, idMedico, idEspecialidad, idEspecialidad, idEstadoTurno, idEstadoTurno];
            const [rows] = await pool.query(sql, params);
            return rows;
        } catch (error) { console.error(error); throw error; }
    },

    async cambiarEstado(idTurno, idEstadoTurno) {
        try {
            if (Number(idEstadoTurno) === 1) {
                const [r] = await pool.query(
                    'UPDATE turno SET idEstadoTurno = ?, idPaciente = NULL, motivo_consulta = NULL, tipo = "normal" WHERE ID = ?',
                    [idEstadoTurno, idTurno]
                );
                return r.affectedRows;
            } else {
                const [r] = await pool.query(
                    'UPDATE turno SET idEstadoTurno = ? WHERE ID = ?',
                    [idEstadoTurno, idTurno]
                );
                return r.affectedRows;
            }
        } catch (error) {
            console.error('Error al cambiar estado del turno:', error);
            throw error;
        }
    },
    
    async findAllEstados() {
        const [rows] = await pool.query('SELECT ID AS id, descripcion FROM estadoturno WHERE ID != 1 ORDER BY ID');
        return rows;
    }
};

module.exports = Turno;