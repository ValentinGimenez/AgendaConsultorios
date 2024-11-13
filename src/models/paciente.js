const pool = require('./db');

const Paciente = {
    async findAll() {
        try {
            const [rows] = await pool.query('SELECT id,idPersona,fotoDni,idObraSocial FROM paciente');
            return rows;
        } catch (error) {
            console.error('Error al obtener todos los pacientes:', error);
            throw error;
        }
    },
    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM paciente WHERE id = ?', [id]); 
        return rows[0];
    },
    async create(data) {
        const { idPersona, idObraSocial,fotoDni } = data;
        const result = await pool.query('INSERT INTO paciente (idPersona, idObraSocial,fotoDni) VALUES (?, ?, ?)', [idPersona, idObraSocial,fotoDni]); 
        return result[0].insertId;
    },
    async update(id, idObraSocial) {
        try {
            await pool.query('UPDATE paciente SET idObraSocial = ? WHERE id = ?', [idObraSocial, id]); 
        }catch (error) {
            console.error('Error al actualizar el paciente:', error);
            throw error;
        }
    },
    async delete(id) {
        await pool.query('DELETE FROM paciente WHERE id = ?', [id]); 
    },
    async obtenerPacienteidPersona(idPersona) {
        const [paciente] = await pool.query('SELECT persona.ID AS personaID, paciente.ID AS pacienteID FROM persona JOIN paciente ON persona.ID = paciente.idPersona WHERE persona.ID = ?',[idPersona]);
        return paciente[0];
    },
    async findPacienteByDni(dni) {
        try {
            const [rows] = await pool.query(`SELECT m.* FROM paciente AS m JOIN persona AS p ON m.idPersona = p.id WHERE p.dni = ?`, [dni]);
            return rows[0];
        } catch (error) {
            console.error('Error al obtener el paciente por DNI:', error);
            throw error;
        }
    },
    // async updatePacienteObraSocial(id,idObraSocial) {
    //     try {
    //       console.log("idObraSocial en el model:",idObraSocial);

    //         await pool.query('UPDATE paciente SET idObraSocial = ? WHERE ID = ?', [id, idObraSocial]); 
    //     } catch (error) {
    //         console.error('Error al actualizar la obra social del paciente:', error);
    //         throw error;
    //     }
    //     },
};

module.exports = Paciente;