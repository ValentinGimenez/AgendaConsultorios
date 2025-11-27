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
    async turnosLibres(id){
        const [rows] = await pool.query('SELECT * FROM turno WHERE idAgenda = ? AND idEstadoTurno = 1 AND fecha >= CURDATE()', [id]);
        return rows;
    },
    async agendarTurno(id,data){
        try {
            const { idPaciente, motivoConsulta } = data;
            await pool.query('UPDATE turno SET idPaciente = ?, idEstadoTurno = 2, tipo= "normal", motivo_consulta = ? WHERE ID = ?', [idPaciente,motivoConsulta,id]);
        } catch (error) {
            console.error('Error al asignar el turno:', error);
            throw error;
        }
    },
    async generarTurnos(data) {
        const { idAgenda, hora_fin, hora_inicio, fecha_inicio, fecha_fin, diaSemana, duracionTurno } = data;
            console.log("data:",data);
        try {
            // Asegúrate de que el procedimiento almacenado se está llamando correctamente
            const [result] = await pool.query('CALL generarTurnos(?,?,?,?,?,?,?)', [
                idAgenda, hora_inicio, hora_fin, fecha_inicio, fecha_fin, diaSemana, duracionTurno
            ]);
            
            // Verifica si hay resultados o si ocurrió un error
            console.log('Resultado de la consulta:', result);
        } catch (error) {
            console.error('Error al llamar al procedimiento:', error);
        }
    }
};

module.exports = Turno;