const pool = require('./db');

const ListaDeEspera = {
    async findAll() {
        const [rows] = await pool.query('SELECT * FROM lista_de_espera'); 
        return rows;
    },
    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM lista_de_espera WHERE id = ?', [id]); 
        return rows[0];
    },
    async create(data) {
        const { idPaciente, idAgenda } = data;
        const result = await pool.query('INSERT INTO lista_de_espera (idPaciente, idAgenda) VALUES (?, ?)', [idPaciente, idAgenda]); 
        return result[0].insertId;
    },
    async update(id, data) {
        const { idPaciente, idAgenda } = data;
        await pool.query('UPDATE lista_de_espera SET idPaciente = ?, idAgenda = ? WHERE id = ?', [idPaciente, idAgenda, id]);
    },
    async delete(id) {
        await pool.query('DELETE FROM lista_de_espera WHERE id = ?', [id]);
    }
};

module.exports = ListaDeEspera;