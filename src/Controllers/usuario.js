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
  // async login(req, res) {
  //   try {
  //     const { nombre, password } = req.body;
  //     const usuario = await Usuario.findByNombre(nombre);

  //     if (usuario) {
  //       const match = await bcrypt.compare(password, usuario.password);

  //       if (match) {
  //         res.json({ message: "Inicio de sesión exitoso" });
  //       } else {
  //         res.status(401).json({ message: "Contraseña incorrecta" });
  //       }
  //     } else {
  //       res.status(404).json({ message: "Usuario no encontrado" });
  //     }
  //   } catch (error) {
  //     console.error("Error al iniciar sesión:", error);
  //     res.status(500).json({ message: "Error al iniciar sesión" });
  //   }
  // },
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
      const { email, password } = req.body;
      
      const usuario = await Usuario.findByEmail(email);

      if (usuario) {
        const match = await bcrypt.compare(password, usuario.password);

        if (match) {
          req.session.user = {
            id: usuario.ID,
            rol: usuario.tipo,
            nombre: usuario.persona_nombre,
            email: usuario.mail
          };
          
          let redirectUrl = "/";
          res.json({ message: "Inicio de sesión exitoso", redirectUrl });
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

  //REGISTRO PÚBLICO
  async register(req, res) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      const { 
        esPacienteExistente, 
        nombre, 
        apellido, 
        dni, 
        email, 
        telefono, 
        password 
      } = req.body;

      let idPersona;

      // Persona/Paciente exisente
      
      if (esPacienteExistente === 'on' || esPacienteExistente === true) {
        const persona = await Persona.findByDni(dni);
        
        if (!persona) {
          throw new Error("No se encontró ninguna persona con ese DNI. Regístrate como nuevo.");
        }

        const usuarioExistente = await Usuario.findByIdPersona(persona.ID || persona.id);
        if (usuarioExistente) {
           throw new Error("Ya existe un usuario registrado para este DNI.");
        }


        const [pacienteRows] = await connection.query('SELECT id FROM paciente WHERE idPersona = ?', [persona.ID || persona.id]);
        if (pacienteRows.length === 0) {
            // Si existe la persona pero no es paciente, lo creamos ahora
            // Nota: Aquí no tenemos foto ni OS, se crean vacíos.
            await connection.query('INSERT INTO paciente (idPersona, fotoDni, idObraSocial) VALUES (?,?, ?)', [persona.ID || persona.id, 'pendiente', 11]);
        }

        // Actualizar mail si es necesario
        if (email && persona.mail !== email) {
            await connection.query('UPDATE persona SET mail = ? WHERE id = ?', [email, persona.ID || persona.id]);
        }
        idPersona = persona.ID || persona.id;
      } 
      //paciente nuevo - persona nueva
      else {
        const personaExiste = await Persona.findByDni(dni);
        if (personaExiste) {
            throw new Error("El DNI ya existe. Marca la casilla '¿Ya te has atendido aquí antes?'.");
        }

        const [resultPersona] = await connection.query(
          "INSERT INTO persona (nombre, apellido, dni, mail, telefono) VALUES (?, ?, ?, ?, ?)",
          [nombre, apellido, dni, email, telefono]
        );
        idPersona = resultPersona.insertId;

        let fotoDniPath = null;
        if (req.file) {
            fotoDniPath = `/uploads/${req.file.filename}`;
        }

        await connection.query(
          "INSERT INTO paciente (idPersona, fotoDni, idObraSocial) VALUES (?, ?, ?)",
          [idPersona, fotoDniPath, 11] 
        );
      }

      await connection.commit();
      connection.release(); 

      await Usuario.create({
          idPersona: idPersona,
          nombre: email,       
          password: password,  
          tipo: 'paciente'
      });

      res.status(201).json({ message: "Registro exitoso", redirectUrl: "/usuario/login" });

    } catch (error) {
      if (connection) {
        await connection.rollback();
        connection.release();
      }
      console.error("Error en registro:", error);
      res.status(400).json({ message: error.message || "Error al procesar el registro" });
    }
  },
};

module.exports = usuarioController;
