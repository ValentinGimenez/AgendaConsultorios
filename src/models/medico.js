const pool = require('./db');

const Medico = {
    async findAll() {
        try {
            const [rows] = await pool.query('SELECT id,idPersona,estado FROM medico');
            return rows;
        } catch (error) {
            console.error('Error al obtener todos los medicos:', error);
            throw error;
        }
    },
    async findById(id) {
        try {
            const [rows] = await pool.query('SELECT * FROM medico WHERE id = ?', [id]);
            return rows[0];
        } catch (error) {
            console.error('Error al obtener el medico por ID:', error);
            throw error;
        }
    },
    async create(data) {
        try {
            const { idPersona, estado } = data; 
            const result = await pool.query('INSERT INTO medico (idPersona, estado) VALUES (?, ?)', [idPersona, estado]); 
            return result[0].insertId;
        } catch (error) {
            console.error('Error al crear el medico:', error);
            throw error;
        }
    },
    async update(id, data) {
        try {
            const { idPersona, estado } = data; 
            await pool.query('UPDATE medico SET idPersona = ?, estado = ? WHERE id = ?', [idPersona, estado, id]);
        } catch (error) {
            console.error('Error al actualizar el medico:', error);
            throw error;
        }
    },
    async updateEstado(id, data) {
        try {
          const { estado } = data;
          await pool.query('UPDATE medico SET estado = ? WHERE id = ?', [estado, id]);
        } catch (error) {
          console.error('Error al actualizar el medico:', error);
          throw error;
        }
      },
    async delete(id) {
        try {
            await pool.query('DELETE FROM medico WHERE id = ?', [id]);
        } catch (error) {
            console.error('Error al eliminar el medico:', error);
            throw error;
        }
    },
    
    async obtenerMedicos(){
        try {
            const [rows] = await pool.query('SELECT medico.id AS medico_id, persona.nombre, persona.apellido, persona.dni, persona.telefono, medico.estado FROM medico JOIN persona ON medico.idPersona=persona.id');
            return rows;
        } catch (error) {
            console.error('Error al obtener todos los medicos:', error);
            throw error;
        }
   },
   async updatePersona(id, mail,telefono) {
    try {
        console.log("Entre al model");
        console.log("id",id);
        console.log("mail",mail);
        console.log("telefono",telefono);

        await pool.query('UPDATE persona SET mail = ?, telefono = ? WHERE id = ?', [mail, telefono, id]);
    } catch (error) {
        console.error('Error al actualizar el medico:', error);
        throw error;
    }
    },
    async findMedicoByDni(dni) {
        try {
            const [rows] = await pool.query(`SELECT m.* FROM medico AS m JOIN persona AS p ON m.idPersona = p.id WHERE p.dni = ?`, [dni]);
            return rows[0];
        } catch (error) {
            console.error('Error al obtener el medico por DNI:', error);
            throw error;
        }
    },
    async findAvailablePersons () {
        try {
            const [rows] = await pool.query(`
                SELECT * 
                FROM persona
                WHERE id NOT IN (SELECT idPersona FROM medico)
            `);
            return rows;
        } catch (error) {
            console.error('Error al obtener personas sin asignación en medico:', error);
            throw error;
        }
    }
};

module.exports = Medico;