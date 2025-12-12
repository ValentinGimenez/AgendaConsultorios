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
        const [rows] = await pool.query('SELECT * FROM turno WHERE idAgenda = ? AND idEstadoTurno = 1 AND fecha >= CURDATE()', [id]);
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
        const [rowsTurno] = await pool.query('SELECT idAgenda, fecha, hora_inicio, hora_fin FROM turno WHERE id = ?', [idTurno]);
        const turnoBase = rowsTurno[0];
        if (!turnoBase) throw new Error('Turno no encontrado');

        const { idAgenda, fecha, hora_inicio, hora_fin } = turnoBase;

        const [rowsAgenda] = await pool.query('SELECT sobreturnoMax FROM agenda WHERE ID = ?', [idAgenda]);
        const agenda = rowsAgenda[0];
        if (!agenda) throw new Error('Agenda no encontrada');
        const max = Number(agenda.sobreturnoMax) || 0;

        //obtener cantidad de sobreturnos reservados para la fecha seleccionada
        const [rowsCount] = await pool.query('SELECT COUNT(*) as count FROM turno WHERE idAgenda = ? AND fecha = ? AND tipo = "sobreturno" AND idEstadoTurno IN (2)', [idAgenda, fecha]);
        const count = Number(rowsCount[0].total) || 0;
        
        if (count >= max) throw new Error('Se alcanzó el máximo de sobreturnos para este día');

        //insertar el sobreturno en la tabla 
        await pool.query(
            `INSERT INTO turno
            (idAgenda, idPaciente, idEstadoTurno, fecha, hora_inicio, hora_fin, tipo, motivo_consulta)
            VALUES (?, ?, 2, ?, ?, ?, 'sobreturno', ?)`,
            [idAgenda, idPaciente, fecha, hora_inicio, hora_fin, motivoConsulta]
        );

    },
    // async turnosSinSobreturnoPorAgenda(idAgenda, data) {
    //     const { fecha, hora_inicio } = data;
    //     const [rows] = await pool.query(
    //         `SELECT * FROM turno WHERE idAgenda = ? AND tipo <> 'sobreturno' AND fecha = ? AND hora_inicio = ?`, [idAgenda, fecha, hora_inicio]);
    //     return rows;
    // }
    async turnosSinSobreturnoPorAgenda(idAgenda) {
        const [rows] = await pool.query(
            `SELECT * FROM turno t WHERE t.idAgenda = ? AND t.tipo <> 'sobreturno'`, [idAgenda]);
        return rows;
    },
    async sobreturnos(idAgenda){
        const [rows] = await pool.query(
            `SELECT * FROM turno t WHERE t.idAgenda = ? AND t.tipo = 'sobreturno'`, [idAgenda]);
        return rows;
    }

};

module.exports = Turno;