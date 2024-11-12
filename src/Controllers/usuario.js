const Usuario = require("../models/usuario");
const Persona = require("../models/persona");
const pool = require("../models/db");
const bcrypt = require("bcrypt");

const usuarioController = {
  async getAll(req, res) {
    try {
      const usuarios = await Usuario.findAll();
      res.json(usuarios);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener los usuarios" });
    }
  },
  async getById(req, res) {
    try {
      const usuario = await Usuario.findById(req.params.id);
      if (usuario) {
        res.json(usuario);
      } else {
        res.status(404).json({ message: "Usuario no encontrado" });
      }
    } catch (error) {
      res.status(500).json({
        message: "Error al obtener el usuario",
      });
    }
  },
  async update(req, res) {
    try {
      const { id } = req.params;
      const { idPersona, nombre, password, tipo } = req.body;

      const persona = await Persona.findById(idPersona);
      if (!persona) {
        return res.status(404).json({ message: "Persona no encontrada" });
      }

      let hashedPassword = null;
      if (password) {
        const saltRounds = 10;
        hashedPassword = await bcrypt.hash(password, saltRounds);
      }

      await Usuario.update(id, {
        idPersona,
        nombre,
        password: hashedPassword || undefined, 
        tipo,
      });

      res.json({ message: "Usuario actualizado" });
    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
      res.status(500).json({ message: "Error al actualizar el usuario" });
    }
  },
  async delete(req, res) {
    try {
      await Usuario.delete(req.params.id);
      res.json({ message: "Usuario eliminado" });
    } catch (error) {
      res.status(500).json({ message: "Error al eliminar el usuario" });
    }
  },
  async login(req, res) {
    try {
      const { nombre, password } = req.body;
      const usuario = await Usuario.findByNombre(nombre);

      if (usuario) {
        const match = await bcrypt.compare(password, usuario.password);

        if (match) {
          res.json({ message: "Inicio de sesión exitoso" });
        } else {
          res.status(401).json({ message: "Contraseña incorrecta" });
        }
      } else {
        res.status(404).json({ message: "Usuario no encontrado" });
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      res.status(500).json({ message: "Error al iniciar sesión" });
    }
  },
  async crearUsuario(req, res) {
    try {
      console.log("Datos recibidos en el body:", req.body);

      const { idPersona, nombre, password, tipo } = req.body;

      const persona = await Persona.findById(parseInt(idPersona, 10));
      if (!persona) {
        return res.status(404).json({ message: "Persona no encontrada" });
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      await pool.query("CALL crear_usuario(?, ?, ?, ?)", [
        idPersona,
        nombre,
        hashedPassword,
        tipo,
      ]);

      // Crear el usuario
      // const id = await Usuario.create({
      //   idPersona: parseInt(idPersona, 10),
      //   nombre,
      //   password: hashedPassword,
      //   tipo,
      // });

      res.status(201).json({message: "Usuario creado exitosamente" });
    } catch (error) {
      console.error("Error al crear el usuario:", error);
      res.status(500).json({ message: "Error al crear el usuario" });
    }
  },
  async login(req, res) {
    try {
      const { nombre, password } = req.body;
      const usuario = await Usuario.findByNombre(nombre);

      if (usuario) {
        const match = await bcrypt.compare(password, usuario.password);

        if (match) {
          req.session.user = {
            id: usuario.id,
            rol: usuario.tipo,
            nombre: usuario.nombre,
          };
          // switch (usuario.tipo) {
          //   case "admin":
          //     res.redirect("/admin"); // Redirigir a la vista de admin
          //     break;
          //   case "paciente":
          //     res.redirect("/paciente"); // Redirigir a la vista de paciente
          //     break;
          //   case "secretaria":
          //     res.redirect("/secretaria"); // Redirigir a la vista de secretaria
          //     break;
          //   default:
              res.redirect("/"); // Redirigir a la página principal
          // }
        } else {
          res.status(401).json({ message: "Contraseña incorrecta" });
        }
      } else {
        res.status(404).json({ message: "Usuario no encontrado" });
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      res.status(500).json({ message: "Error al iniciar sesión" });
    }
  },
};

module.exports = usuarioController;
