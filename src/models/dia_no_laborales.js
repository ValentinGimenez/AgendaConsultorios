const pool = require('./db');

const DiaNoLaborales = {
    async findAll() {
        const [rows] = await pool.query('SELECT * FROM dia_no_laborales'); 
        return rows;
    },

    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM dia_no_laborales WHERE id = ?', [id]);
        return rows[0];
    },

    async create(data) {
        const { fecha_inicio, fecha_fin, descripcion,tipo,all_day,idMedico,idSucursal,hora_inicio,hora_fin } = data;
        const [result] = await pool.query(
            'INSERT INTO dia_no_laborales (fecha_inicio, fecha_fin, descripcion, tipo, all_day, idMedico, idSucursal, hora_inicio, hora_fin ) VALUES (?,?,?,?,?,?,?,?,?)',
            [fecha_inicio, fecha_fin, descripcion,tipo,all_day,idMedico,idSucursal,hora_inicio,hora_fin ]
        ); 
        return result.insertId;
    },

    async update(id, data) {
        let {  fecha_inicio, fecha_fin, descripcion,tipo,all_day,idMedico,idSucursal,hora_inicio,hora_fin } = data;
        idMedico   = toNullableInt(idMedico);
        idSucursal = toNullableInt(idSucursal);
        if (idMedico != null) idSucursal = null;
        if (idSucursal != null) idMedico = null;
        await pool.query(
            'UPDATE dia_no_laborales SET fecha_inicio = ?, fecha_fin = ?, descripcion = ?, tipo = ?, idMedico = ?, idSucursal = ?, all_day = ?, hora_inicio = ?, hora_fin = ? WHERE ID = ?',
            [fecha_inicio, fecha_fin, descripcion,tipo,idMedico,idSucursal,all_day,hora_inicio,hora_fin,id ]
        ); 
    },

    async delete(id) {
        await pool.query('UPDATE dia_no_laborales SET estado = "inactivo" WHERE ID = ?;', [id]); 
    }
};
function toNullableInt(v) {
  if (v === undefined || v === null) return null;
  if (v === '' || v === '0' || v === 0) return null;

  const n = Number(v);
  return Number.isNaN(n) || n <= 0 ? null : n;
}
module.exports = DiaNoLaborales;
