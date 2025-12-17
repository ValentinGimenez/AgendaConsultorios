const ListaDeEspera = require('../models/lista_de_espera'); 
const pacienteController = require('../Controllers/paciente');     
const medicoController = require('../Controllers/medico');         
const Especialidad = require('../models/especialidad'); 
const Sucursal = require('../models/sucursal');
const listaDeEsperaController = {
    
    async getAll(req, res) {
        try {
            const listaDeEsperaDetallada = await ListaDeEspera.findAllConDetalles(); 
            res.json(listaDeEsperaDetallada);
        } catch (error) {
            console.error('Error al obtener la lista de espera detallada:', error);
            res.status(500).json({ message: 'Error al obtener la lista de espera detallada' });
        }
    },

    async getById(req, res) {
        try {
            const item = await ListaDeEspera.findById(req.params.id);
            if (!item) {
                return res.status(404).json({ message: 'Registro no encontrado' });
            }
            res.json(item);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al buscar el registro' });
        }
    },

    // async create(req, res) {
    //     try {
    //         const id = await ListaDeEspera.create(req.body);
    //         res.status(201).json({ 
    //             message: 'Agregado a lista de espera correctamente',
    //             id 
    //         });
    //     } catch (error) {
    //         console.error(error);
    //         res.status(500).json({ message: 'Error al crear el registro' });
    //     }
    // },

    async update(req, res) {
        try {
            const item = await ListaDeEspera.findById(req.params.id);
            if (!item) {
                return res.status(404).json({ message: 'Registro no encontrado para actualizar' });
            }

            await ListaDeEspera.update(req.params.id, req.body);
            res.json({ message: 'Item en lista de espera actualizado' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al actualizar el registro' });
        }
    },

    async delete(req, res) {
        try {
            await ListaDeEspera.delete(req.params.id);
            res.json({ message: 'Item en lista de espera eliminado' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al eliminar el registro' });
        }
    },

    async getByEspecialidad(req, res) {
        try {
            const lista = await ListaDeEspera.findByEspecialidad(req.params.idEspecialidad);
            res.json(lista);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al filtrar por especialidad' });
        }
    },
    async getVistaListaEspera(req, res) {
        try {
            const [
                pacientes, 
                medicos, 
                especialidades,   
                sucursales,       
                listaEspera       
            ] = await Promise.all([
                pacienteController.getAll(null, {}), 
                medicoController.getAll(null, {}),  
                Especialidad.findAll(),
                Sucursal.findAll(),
                ListaDeEspera.findAllConDetalles(), 
            ]);

            res.render('secretaria/lista-espera', { 
                pacientes,
                especialidades,
                medicos,
                sucursales,
                listaEspera: listaEspera 
            });

        } catch (error) {
            console.error('Error al cargar vista de lista de espera:', error);
            res.status(500).send('Error interno.');
        }
    },
    
    async create(req, res) {
        const { idPaciente, idEspecialidad, idMedico, idSucursal, fecha_vencimiento } = req.body;

        if (!idPaciente || !idEspecialidad) {
            return res.status(400).json({ message: 'Paciente y Especialidad son obligatorios.' });
        }

        try {
            const dataToCreate = {
                idPaciente,
                idEspecialidad,
                idMedico: idMedico ? idMedico : null,
                idSucursal: idSucursal ? idSucursal : null,
                fecha_vencimiento: fecha_vencimiento ? fecha_vencimiento : null 
            };

            await ListaDeEspera.create(dataToCreate);

            return res.status(201).json({ message: 'Paciente registrado en lista de espera.' });

        } catch (error) {
            console.error("Error al registrar en lista de espera:", error);
            return res.status(500).json({ message: 'Error interno del servidor al registrar.' });
        }
    },
};

module.exports = listaDeEsperaController;