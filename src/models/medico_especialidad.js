const pool = require('./db');

const MedicoEspecialidad = {
    async findAll() {
        const [rows] = await pool.query('SELECT * FROM medico_especialidad'); 
        return rows;
    },
    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM medico_especialidad WHERE id = ?', [id]);
        return rows[0];
    },
    async create(data) {
        const { idMedico, idEspecialidad } = data;
        const result = await pool.query('INSERT INTO medico_especialidad (idMedico, idEspecialidad) VALUES (?, ?)', [idMedico, idEspecialidad]); 
        return result[0].insertId;
    },
    async update(id, data) {
        const { idMedico, idEspecialidad } = data;
        await pool.query('UPDATE medico_especialidad SET idMedico = ?, idEspecialidad = ? WHERE id = ?', [idMedico, idEspecialidad, id]); 
    },
    async delete(id) {
        await pool.query('DELETE FROM medico_especialidad WHERE id = ?', [id]);
    },
    async obtenerEspecialidad(id){
        const [rows] =await pool.query('SELECT * FROM especialidad e JOIN medico_especialidad me ON e.id = me.idEspecialidad WHERE me.idMedico = ?', [id]);
        return rows;
    },
    async obtenerMedicos(id){
        const [rows] =await pool.query('SELECT m.id AS medico_id, CONCAT(p.nombre, " ", p.apellido) AS nombre_completo, p.dni, p.telefono, m.estado, me.idEspecialidad FROM medico m JOIN medico_especialidad me ON m.id = me.idMedico JOIN persona p ON m.idPersona = p.id WHERE me.idEspecialidad = ?', [id]);
        return rows;
    },
    async obtenerTodosMedicos(){
        const [rows] =await pool.query('SELECT DISTINCT m.id AS medico_id, CONCAT(p.nombre, " ", p.apellido) AS nombre_completo, p.dni, p.telefono, m.estado FROM medico m JOIN medico_especialidad me ON m.id = me.idMedico JOIN persona p ON m.idPersona = p.id');
        return rows;
    },
    async obtenerTodasEspecialidades(){
        const [rows] =await pool.query('SELECT DISTINCT e.id, e.nombre FROM especialidad e JOIN medico_especialidad me ON e.id = me.idEspecialidad');
        return rows;
    },
    async obtenerid(data){
        const { idMedico, idEspecialidad } = data;
        const [rows] = await pool.query(
            'SELECT id FROM medico_especialidad WHERE idMedico = ? AND idEspecialidad = ?', 
            [idMedico, idEspecialidad]
        );
        return rows.length > 0 ? rows[0] : null;
    },
    async obtenerEspecialidades(medicoId) {
        try {
          const [rows] = await pool.query(
            `SELECT e.id, e.nombre, me.matricula 
             FROM especialidad e 
             JOIN medico_especialidad me ON e.id = me.idEspecialidad 
             WHERE me.idMedico = ?`, 
            [medicoId]
          );
          return rows;
        } catch (error) {
          console.error('Error al obtener las especialidades del médico:', error);
          throw error;
        }
      },
      async agregarEspecialidad(medicoId, especialidadId, matricula) { 
        try {
          await pool.query('INSERT INTO medico_especialidad (idMedico, idEspecialidad, matricula) VALUES (?, ?, ?)', [medicoId, especialidadId, matricula]);
        } catch (error) {
          console.error('Error al agregar especialidad al médico en el modelo:', error);
          throw error;
        }
      },
    
      async quitarEspecialidad(medicoId, especialidadId) {
        try {
          await pool.query('DELETE FROM medico_especialidad WHERE idMedico = ? AND idEspecialidad = ?', [medicoId, especialidadId]);
        } catch (error) {
          console.error('Error al quitar especialidad del médico en el modelo:', error);
          throw error;
        }
      },
      async update(id, data) {
        try {
            await pool.query('UPDATE medico SET idPersona = ?, estado = ? WHERE id = ?', [idPersona, estado, id]);
        } catch (error) {
            console.error('Error al actualizar el medico:', error);
            throw error;
        }
    },
    async findMatricula(matricula) {
      try {
        const [rows] = await pool.query('SELECT id FROM medico_especialidad WHERE matricula = ?', [matricula]);
        return rows.length > 0; // Devuelve true si se encuentra la matrícula
      } catch (error) {
        console.error('Error al buscar la matrícula:', error);
        throw error;
      }
    },
};

module.exports = MedicoEspecialidad;