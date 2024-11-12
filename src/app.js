const createError = require("http-errors");
const express = require("express");
const session = require('express-session');
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const pool = require("./models/db");

const indexRouter = require("./routes/index");
const usuarioR = require("./routes/usuario");
const agendaR = require("./routes/agenda");
const ausenciaR = require("./routes/ausencia");
const clasificacionR = require("./routes/clasificacion");
const dia_no_laboralesR = require("./routes/dia_no_laborales");
const especialidadR = require("./routes/especialidad");
const estado_turnoR = require("./routes/estado_turno");
const horarioR = require("./routes/horario");
const lista_de_esperaR = require("./routes/lista_de_espera");
const medico_especialidadR = require("./routes/medico_especialidad");
const medicoR = require("./routes/medico");
const obrasocialR = require("./routes/obrasocial");
const pacienteR = require("./routes/paciente");
const personaR = require("./routes/persona");
const sucursalR = require("./routes/sucursal");
const turnoR = require("./routes/turno");

const app = express();

app.use(session({
  secret: 'consultoriomedico',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false, 
    // maxAge: 60000// 1 m
    // maxAge: 600000// 10 m
    maxAge: 3600000// 1 h

  }
}));

// Configuración del motor de vistas
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Rutas para las vistas (debes revisar si estas rutas son correctas)
app.get("/turnos", async (req, res) => {
  const id = req.query.id;
  res.render("calendar", { id });
});

app.get("/horario/:id", async (req, res) => {
  const id = req.params.id;
  res.render("horario", { id });
});
// Middlewares
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
// Rutas
app.use("/", indexRouter);

// Rutas de los controladores (CORREGIDO)
app.use("/usuario", usuarioR);
app.use("/agenda", agendaR);
app.use("/horario", horarioR);
app.use("/clasificacion", clasificacionR);
app.use("/ausencia", ausenciaR);
app.use("/dia_no_laborales", dia_no_laboralesR); // Asegúrate de que la ruta sea correcta
app.use("/especialidad", especialidadR);
app.use("/estado_turno", estado_turnoR);
app.use("/lista_de_espera", lista_de_esperaR); // Asegúrate de que la ruta sea correcta
app.use("/medico_especialidad", medico_especialidadR); // Asegúrate de que la ruta sea correcta
app.use("/medico", medicoR);
app.use("/obrasocial", obrasocialR);
app.use("/paciente", pacienteR);
app.use("/persona", personaR);
app.use("/sucursal", sucursalR);
app.use("/turno", turnoR);

// Manejo de errores
app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

// Prueba de conexión a la base de datos
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error al conectar a la base de datos:", err);
    process.exit(1);
  } else {
    console.log("Conexión a la base de datos establecida con éxito.");
    connection.release();
  }
});

module.exports = app;
