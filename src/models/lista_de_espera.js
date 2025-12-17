const pool = require('./db');

const ListaDeEspera = {
    async findAll() {
        const [rows] = await pool.query('SELECT * FROM lista_de_espera'); 
        return rows;
    },

    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM lista_de_espera WHERE ID = ?', [id]); 
        return rows[0];
    },

    async create(data) {
        const { 
            idPaciente, 
            idEspecialidad, 
            idSucursal, 
            idMedico, 
            fecha_vencimiento, 
            estado 
        } = data;

        const result = await pool.query(
            `INSERT INTO lista_de_espera 
            (idPaciente, idEspecialidad, idSucursal, idMedico, fecha_registro, fecha_vencimiento, estado) 
            VALUES (?, ?, ?, ?, NOW(), ?, ?)`, 
            [
                idPaciente, 
                idEspecialidad, 
                idSucursal || null, 
                idMedico || null, 
                fecha_vencimiento || null, 
                estado || 'PENDIENTE'
            ]
        ); 
        return result[0].insertId;
    },

    async update(id, data) {
        const { 
            idPaciente, 
            idEspecialidad, 
            idSucursal, 
            idMedico, 
            fecha_vencimiento, 
            estado 
        } = data;

        await pool.query(
            `UPDATE lista_de_espera 
            SET idPaciente = ?, 
                idEspecialidad = ?, 
                idSucursal = ?, 
                idMedico = ?, 
                fecha_vencimiento = ?, 
                estado = ? 
            WHERE ID = ?`, 
            [
                idPaciente, 
                idEspecialidad, 
                idSucursal || null, 
                idMedico || null, 
                fecha_vencimiento || null, 
                estado, 
                id
            ]
        );
    },

    async delete(id) {
        await pool.query('DELETE FROM lista_de_espera WHERE ID = ?', [id]);
    },

    async findByEspecialidad(idEspecialidad, idSucursal = null) {
        let query = 'SELECT * FROM lista_de_espera WHERE idEspecialidad = ? AND estado = "PENDIENTE"';
        const params = [idEspecialidad];

        if (idSucursal) {
            query += ' AND (idSucursal IS NULL OR idSucursal = ?)';
            params.push(idSucursal);
        }

        query += ' ORDER BY fecha_registro ASC';
        
        const [rows] = await pool.query(query, params);
        return rows;
    },
    async findAllConDetalles() {
        const [rows] = await pool.query(`
            SELECT 
                le.*, 
                p_paciente.nombre AS pacienteNombre,
                p_paciente.apellido AS pacienteApellido,
                e.nombre AS especialidadNombre,
                s.nombre AS sucursalNombre,
                p_medico.nombre AS medicoNombre,
                p_medico.apellido AS medicoApellido
            FROM 
                lista_de_espera le
            JOIN 
                paciente pac ON pac.ID = le.idPaciente
            JOIN 
                persona p_paciente ON p_paciente.ID = pac.idPersona
            JOIN 
                especialidad e ON e.ID = le.idEspecialidad
            LEFT JOIN 
                sucursal s ON s.ID = le.idSucursal
            LEFT JOIN 
                medico m ON m.ID = le.idMedico
            LEFT JOIN
                persona p_medico ON p_medico.ID = m.idPersona
            ORDER BY 
                le.fecha_registro ASC;
        `); 
        return rows;
    },
};

module.exports = ListaDeEspera;