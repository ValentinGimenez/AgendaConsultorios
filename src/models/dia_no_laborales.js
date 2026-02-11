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
        const { fecha_inicio, fecha_fin, descripcion, tipo, all_day, idMedico, idSucursal, hora_inicio, hora_fin } = data;
        const [result] = await pool.query(
            'INSERT INTO dia_no_laborales (fecha_inicio, fecha_fin, descripcion, tipo, all_day, idMedico, idSucursal, hora_inicio, hora_fin ) VALUES (?,?,?,?,?,?,?,?,?)',
            [fecha_inicio, fecha_fin, descripcion, tipo, all_day, idMedico, idSucursal, hora_inicio, hora_fin]
        );
        return result.insertId;
    },

    async update(id, data) {
        let { fecha_inicio, fecha_fin, descripcion, tipo, all_day, idMedico, idSucursal, hora_inicio, hora_fin } = data;
        idMedico = toNullableInt(idMedico);
        idSucursal = toNullableInt(idSucursal);
        if (idMedico != null) idSucursal = null;
        if (idSucursal != null) idMedico = null;
        await pool.query(
            'UPDATE dia_no_laborales SET fecha_inicio = ?, fecha_fin = ?, descripcion = ?, tipo = ?, idMedico = ?, idSucursal = ?, all_day = ?, hora_inicio = ?, hora_fin = ? WHERE ID = ?',
            [fecha_inicio, fecha_fin, descripcion, tipo, idMedico, idSucursal, all_day, hora_inicio, hora_fin, id]
        );
    },

    async delete(id) {
        await pool.query('UPDATE dia_no_laborales SET estado = "inactivo" WHERE ID = ?;', [id]);
    },
    async resolverBloquesAusencia({ idMedico, fecha, all_day, hora_inicio, hora_fin }) {
        const diaSemana = getDiaSemanaEnumFromFecha(fecha);

        if (!diaSemana) {
            return { dia_semana: 'DOMINGO', count: 0, bloques: [] };
        }

        const sql = `
    SELECT
      a.ID   AS idAgenda,
      a.idSucursal,
      a.idEspecialidadMedico,
      h.hora_inicio AS h_ini,
      h.hora_fin   AS h_fin
    FROM agenda a
    JOIN medico_especialidad me ON me.ID = a.idEspecialidadMedico
    JOIN horario h ON h.idAgenda = a.ID
    WHERE me.idMedico = ?
      AND h.estado = 'activo'
      AND ? BETWEEN h.fecha_inicio AND h.fecha_fin
      AND h.dia_semana = ?
    ORDER BY a.idSucursal, a.idEspecialidadMedico, h.hora_inicio;
  `;

        const [rows] = await pool.query(sql, [idMedico, fecha, diaSemana]);

        const bloques = [];
        for (const r of rows) {
            const hIni = (r.h_ini || '').toString().slice(0, 5);
            const hFin = (r.h_fin || '').toString().slice(0, 5);
            if (!hIni || !hFin || hFin <= hIni) continue;

            if (Number(all_day) === 1) {
                bloques.push({
                    idAgenda: Number(r.idAgenda),
                    idSucursal: Number(r.idSucursal),
                    idEspecialidadMedico: Number(r.idEspecialidadMedico),
                    hora_inicio: hIni,
                    hora_fin: hFin
                });
            } else {
                const bIni = maxTime(hora_inicio, hIni);
                const bFin = minTime(hora_fin, hFin);
                if (bFin > bIni) {
                    bloques.push({
                        idAgenda: Number(r.idAgenda),
                        idSucursal: Number(r.idSucursal),
                        idEspecialidadMedico: Number(r.idEspecialidadMedico),
                        hora_inicio: bIni,
                        hora_fin: bFin
                    });
                }
            }
        }
        const uniq = [];
        const seen = new Set();
        for (const b of bloques) {
            const k = `${b.idAgenda}|${b.hora_inicio}|${b.hora_fin}`;
            if (!seen.has(k)) {
                seen.add(k);
                uniq.push(b);
            }
        }
        return {
            dia_semana: diaSemana,
            count: uniq.length,
            bloques: uniq
        };
    },
    async aplicarAccionTurnos(payload) {
  const {
    accion_turnos,
    bloques,
    alcance,
    idMedico,
    idSucursal,
    fecha_inicio,
    fecha_fin,
    all_day,
    hora_inicio,
    hora_fin
  } = payload;

  const ACCIONES_VALIDAS = ['ESPERA', 'CANCELAR'];
  if (!ACCIONES_VALIDAS.includes(accion_turnos)) return { updated: 0 };

  let updated = 0;
  const useHours = Number(all_day) === 0 && hora_inicio && hora_fin;

  if (accion_turnos === 'ESPERA') {
    const turnosActivos = await this._obtenerTurnosActivosAfectados({
      bloques, alcance, idMedico, idSucursal,
      fecha_inicio, fecha_fin, all_day, hora_inicio, hora_fin
    });
        console.log("TURNOS ACTIVOS",turnosActivos[0])
    for (const t of turnosActivos) {
      await pool.query(
        `INSERT INTO lista_de_espera (idPaciente, idEspecialidad, idSucursal, idMedico, fecha_registro, fecha_vencimiento, estado)
         VALUES (?, ?, ?, ?, ?,?, 'pendiente')`,
        [t.idPaciente, t.idEspecialidad, t.idSucursal, t.idMedico, t.fecha, t.fecha]

      );
    }
  }

  if (Array.isArray(bloques) && bloques.length > 0) {
    for (const b of bloques) {
      const idAgenda = Number(b.idAgenda);
      const fecha = (b.fecha || fecha_inicio);
      const bIni = String(b.hora_inicio).slice(0, 5);
      const bFin = String(b.hora_fin).slice(0, 5);

      if (!idAgenda || !fecha || !bIni || !bFin || bFin <= bIni) continue;

      const sql = `
        UPDATE turno t
        SET t.idEstadoTurno = CASE
          WHEN t.idEstadoTurno IN (${ACTIVO_ESTADOS.map(() => '?').join(',')}) THEN ?
          WHEN t.idEstadoTurno = ? THEN ?
          ELSE t.idEstadoTurno
        END
        WHERE t.idAgenda = ?
          AND t.fecha = ?
          AND t.hora_inicio < ?
          AND t.hora_fin > ?
          AND (t.idEstadoTurno IN (${ACTIVO_ESTADOS.map(() => '?').join(',')}) OR t.idEstadoTurno = ?)
      `;

      const params = [
        ...ACTIVO_ESTADOS,
        ESTADO_CANCELADO,      
        ESTADO_LIBRE,          
        ESTADO_NO_DISPONIBLE,  
        idAgenda, fecha, bFin, bIni,
        ...ACTIVO_ESTADOS,
        ESTADO_LIBRE
      ];

      const [r] = await pool.query(sql, params);
      updated += r.affectedRows || 0;
    }

    return { updated };
  }

  const { caseSql, caseParams, whereExtra, whereParams } = buildCaseEstadoSql();

  if (alcance === 'GLOBAL') {
    let sql = `
      UPDATE turno t
      ${caseSql}
      WHERE t.fecha BETWEEN ? AND ?
      ${whereExtra}
    `;
    const params = [...caseParams, fecha_inicio, fecha_fin, ...whereParams];

    if (useHours) {
      sql += ` AND t.hora_inicio < ? AND t.hora_fin > ? `;
      params.push(hora_fin, hora_inicio);
    }

    const [r] = await pool.query(sql, params);
    updated += r.affectedRows || 0;
  }

  if (alcance === 'SUCURSAL') {
    let sql = `
      UPDATE turno t
      JOIN agenda a ON a.ID = t.idAgenda
      ${caseSql}
      WHERE a.idSucursal = ?
        AND t.fecha BETWEEN ? AND ?
        ${whereExtra}
    `;
    const params = [...caseParams, Number(idSucursal), fecha_inicio, fecha_fin, ...whereParams];

    if (useHours) {
      sql += ` AND t.hora_inicio < ? AND t.hora_fin > ? `;
      params.push(hora_fin, hora_inicio);
    }

    const [r] = await pool.query(sql, params);
    updated += r.affectedRows || 0;
  }

  if (alcance === 'PROFESIONAL') {
    const [agendas] = await pool.query(
      `SELECT a.ID AS idAgenda
       FROM agenda a
       JOIN medico_especialidad me ON me.ID = a.idEspecialidadMedico
       WHERE me.idMedico = ?`,
      [Number(idMedico)]
    );

    for (const a of agendas) {
      let sql = `
        UPDATE turno t
        ${caseSql}
        WHERE t.idAgenda = ?
          AND t.fecha BETWEEN ? AND ?
          ${whereExtra}
      `;
      const params = [...caseParams, Number(a.idAgenda), fecha_inicio, fecha_fin, ...whereParams];

      if (useHours) {
        sql += ` AND t.hora_inicio < ? AND t.hora_fin > ? `;
        params.push(hora_fin, hora_inicio);
      }

      const [r] = await pool.query(sql, params);
      updated += r.affectedRows || 0;
    }
  }

  return { updated };
},

    async verificarTurnos({
        tipo,
        alcance,
        idMedico,
        idSucursal,
        fecha_inicio,
        fecha_fin,
        all_day,
        hora_inicio,
        hora_fin,
        bloques,
        excludeDiaId
    }) {
        if (Array.isArray(bloques) && bloques.length > 0) {
            const turnos = [];

            for (const b of bloques) {
                const idAgenda = Number(b.idAgenda);
                const fecha = b.fecha || fecha_inicio;
                const bIni = String(b.hora_inicio).slice(0, 5);
                const bFin = String(b.hora_fin).slice(0, 5);

                if (!idAgenda || !fecha || !bIni || !bFin || bFin <= bIni) continue;

                const sql = `
        SELECT
          t.idAgenda,
          t.idPaciente,
          t.idEstadoTurno,
          t.fecha,
          t.hora_inicio,
          t.hora_fin,
          t.tipo,
          t.motivo_consulta,
          a.idSucursal,
          a.idEspecialidadMedico,
          s.nombre AS sucursal,
          CONCAT(pp.nombre, ' ', pp.apellido) AS paciente

        FROM turno t
        JOIN agenda a ON a.ID = t.idAgenda
        JOIN sucursal s ON s.ID = a.idSucursal
        JOIN paciente pa ON pa.ID = t.idPaciente
        JOIN persona pp ON pp.ID = pa.idPersona

        WHERE t.idAgenda = ?
          AND t.fecha = ?
          AND t.hora_inicio < ?
          AND t.hora_fin > ?
          AND t.idEstadoTurno IN (${ACTIVO_ESTADOS.map(() => '?').join(',')})
      `;

                const params = [idAgenda, fecha, bFin, bIni, ...ACTIVO_ESTADOS];
                const [rows] = await pool.query(sql, params);


                for (const r of rows) turnos.push(r);
            }

            const uniq = uniqBy(turnos, t => String(t.idTurno));


            return { count: uniq.length, turnos: uniq };
        }


        let sqlAgendas = `
    SELECT a.ID AS idAgenda, a.idSucursal, a.idEspecialidadMedico
    FROM agenda a
  `;
        const paramsAgendas = [];

        if (alcance === 'SUCURSAL') {
            sqlAgendas += ` WHERE a.idSucursal = ? `;
            paramsAgendas.push(idSucursal);
        } else if (alcance === 'PROFESIONAL') {
            sqlAgendas += ` JOIN medico_especialidad me ON me.ID = a.idEspecialidadMedico
                   WHERE me.idMedico = ? `;
            paramsAgendas.push(idMedico);
        }

        const [agendas] = await pool.query(sqlAgendas, paramsAgendas);

        if (!agendas || agendas.length === 0) return { count: 0, turnos: [] };

        const turnos = [];

        for (const a of agendas) {
            let sqlT = `
      SELECT
        t.idAgenda,
        t.idPaciente,
        t.idEstadoTurno,
        t.fecha,
        t.hora_inicio,
        t.hora_fin,
        t.tipo,
        t.motivo_consulta,
        ag.idSucursal,
        s.nombre AS sucursal,
          CONCAT(pp.nombre, ' ', pp.apellido) AS paciente

      FROM turno t
      JOIN agenda ag ON ag.ID = t.idAgenda
      JOIN sucursal s ON s.ID = ag.idSucursal
      JOIN paciente pa ON pa.ID = t.idPaciente
      JOIN persona pp ON pp.ID = pa.idPersona
      WHERE t.idAgenda = ?
        AND t.fecha BETWEEN ? AND ?
        AND t.idEstadoTurno IN (${ACTIVO_ESTADOS.map(() => '?').join(',')})
    `;
            const p = [Number(a.idAgenda), fecha_inicio, fecha_fin, ...ACTIVO_ESTADOS];

            if (Number(all_day) === 0 && hora_inicio && hora_fin) {
                sqlT += ` AND t.hora_inicio < ? AND t.hora_fin > ? `;
                p.push(hora_fin, hora_inicio);
            }

            const [rows] = await pool.query(sqlT, p);
            for (const r of rows) turnos.push(r);
        }

        const uniq = uniqBy(turnos, t => String(t.idTurno));


        return { count: uniq.length, turnos: uniq };
    },
      async _obtenerTurnosActivosAfectados({
    bloques, alcance, idMedico, idSucursal,
    fecha_inicio, fecha_fin, all_day, hora_inicio, hora_fin
  }) {
    const useHours = Number(all_day) === 0 && hora_inicio && hora_fin;
    const turnos = [];

    if (Array.isArray(bloques) && bloques.length > 0) {
      for (const b of bloques) {
        const idAgenda = Number(b.idAgenda);
        const fecha = b.fecha || fecha_inicio;
        const bIni = String(b.hora_inicio).slice(0, 5);
        const bFin = String(b.hora_fin).slice(0, 5);
        if (!idAgenda || !fecha || !bIni || !bFin || bFin <= bIni) continue;

        const [rows] = await pool.query(`
            SELECT
            t.ID AS idTurno,
            t.idPaciente,
            t.idAgenda,
            DATE(t.fecha) AS fecha,
            t.hora_inicio,
            t.hora_fin,
            a.idSucursal,
            me.idEspecialidad,
            me.idMedico
            FROM turno t
            JOIN agenda a ON a.ID = t.idAgenda
            JOIN medico_especialidad me ON me.ID = a.idEspecialidadMedico
            WHERE t.idAgenda = ?
            AND DATE(t.fecha) = ?
            AND t.hora_inicio < ?
            AND t.hora_fin > ?
            AND t.idEstadoTurno IN (${ACTIVO_ESTADOS.map(() => '?').join(',')})`,
          [idAgenda, fecha, bFin, bIni, ...ACTIVO_ESTADOS]
        );
        turnos.push(...rows);
      }
      return uniqBy(turnos, t => String(t.idTurno));
    }

    let sqlAgendas = 'SELECT a.ID AS idAgenda FROM agenda a';
    const paramsAgendas = [];

    if (alcance === 'SUCURSAL') {
      sqlAgendas += ' WHERE a.idSucursal = ?';
      paramsAgendas.push(idSucursal);
    } else if (alcance === 'PROFESIONAL') {
      sqlAgendas += ' JOIN medico_especialidad me ON me.ID = a.idEspecialidadMedico WHERE me.idMedico = ?';
      paramsAgendas.push(idMedico);
    }

    const [agendas] = await pool.query(sqlAgendas, paramsAgendas);

    for (const a of agendas) {
      let sql = `SELECT
    t.ID AS idTurno,
    t.idPaciente,
    t.idAgenda,
    DATE(t.fecha) AS fecha,
    t.hora_inicio,
    t.hora_fin,
    a.idSucursal,
    me.idEspecialidad,
    me.idMedico
  FROM turno t
  JOIN agenda a ON a.ID = t.idAgenda
  JOIN medico_especialidad me ON me.ID = a.idEspecialidadMedico
  WHERE t.idAgenda = ?
    AND DATE(t.fecha) BETWEEN ? AND ?
    AND t.idEstadoTurno IN  (${ACTIVO_ESTADOS.map(() => '?').join(',')})`;
      const p = [Number(a.idAgenda), fecha_inicio, fecha_fin, ...ACTIVO_ESTADOS];

      if (useHours) {
        sql += ' AND t.hora_inicio < ? AND t.hora_fin > ?';
        p.push(hora_fin, hora_inicio);
      }

      const [rows] = await pool.query(sql, p);
      turnos.push(...rows);
    }

    return uniqBy(turnos, t => String(t.idTurno));
  },
}
function toNullableInt(v) {
    if (v === undefined || v === null) return null;
    if (v === '' || v === '0' || v === 0) return null;

    const n = Number(v);
    return Number.isNaN(n) || n <= 0 ? null : n;
}
function getDiaSemanaEnumFromFecha(fecha) {

    const d = new Date(`${fecha}T00:00:00Z`);
    const day = d.getUTCDay();
    const map = [null, 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO']; 
    return map[day] || null;
}
const ACTIVO_ESTADOS = [2, 4];
const ESTADO_NO_DISPONIBLE = 5;
const ESTADO_LIBRE = 1;
const ESTADO_CANCELADO = 6;

function uniqBy(arr, keyFn) {
    const seen = new Set();
    const out = [];
    for (const x of arr) {
        const k = keyFn(x);
        if (!seen.has(k)) { seen.add(k); out.push(x); }
    }
    return out;
}
function buildCaseEstadoSql() {
    const inActivos = ACTIVO_ESTADOS.map(() => '?').join(',');

    const caseSql = `
    SET t.idEstadoTurno = CASE
      WHEN t.idEstadoTurno IN (${inActivos}) THEN ?
      WHEN t.idEstadoTurno = ? THEN ?
      ELSE t.idEstadoTurno
    END
  `;

    const caseParams = [
        ...ACTIVO_ESTADOS,
        ESTADO_CANCELADO,
        ESTADO_LIBRE,
        ESTADO_NO_DISPONIBLE
    ];

    const whereExtra = ` AND (t.idEstadoTurno IN (${inActivos}) OR t.idEstadoTurno = ?) `;
    const whereParams = [...ACTIVO_ESTADOS, ESTADO_LIBRE];

    return { caseSql, caseParams, whereExtra, whereParams };
}


function maxTime(a, b) { return a >= b ? a : b; } 
function minTime(a, b) { return a <= b ? a : b; }
module.exports = DiaNoLaborales;
