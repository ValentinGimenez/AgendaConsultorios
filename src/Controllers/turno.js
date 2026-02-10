const Turno = require('../models/turno');
const MedicoEspecialidad = require('../models/medico_especialidad');
const Paciente = require('../models/paciente');
const ESTADOS = {
    LIBRE: 1,
    RESERVADO: 2,
    ATENDIDO: 3,
    CONFIRMADO: 4,
    NO_DISPONIBLE: 5,
    CANCELADO: 6,
    AUSENTE: 7,
    PRESENTE: 8,
    EN_CONSULTA: 9
};

function accionesPorEstado(idEstadoTurno) {
    switch (Number(idEstadoTurno)) {
        case ESTADOS.RESERVADO: // 2
            return [
                { to: ESTADOS.CONFIRMADO, icon: '✓', title: 'Confirmar', class: 'btn-confirmar' },
                { to: ESTADOS.CANCELADO, icon: '✕', title: 'Cancelar', class: 'btn-cancelar' },
                { to: ESTADOS.LIBRE, icon: '🔓', title: 'Liberar Turno', class: 'btn-liberar' }
            ];
        case ESTADOS.CONFIRMADO: // 4
            return [
                { to: ESTADOS.PRESENTE, icon: '👤', title: 'Dar Presente', class: 'btn-presente' },
                { to: ESTADOS.AUSENTE, icon: '🙈', title: 'Marcar Ausente', class: 'btn-ausente' },
                { to: ESTADOS.CANCELADO, icon: '✕', title: 'Cancelar', class: 'btn-cancelar' }
            ];
        case ESTADOS.PRESENTE: // 8
            return [
                { to: ESTADOS.EN_CONSULTA, icon: '🩺', title: 'Pasar a Consulta', class: 'btn-consulta' },
                { to: ESTADOS.AUSENTE, icon: '🙈', title: 'Marcar Ausente', class: 'btn-ausente' }
            ];
        case ESTADOS.EN_CONSULTA: // 9
            return [
                { to: ESTADOS.ATENDIDO, icon: '✓✓', title: 'Finalizar (Atendido)', class: 'btn-atendido' }
            ];
        case ESTADOS.CANCELADO: // 6
        case ESTADOS.AUSENTE: // 7
            return [
                 { to: ESTADOS.LIBRE, icon: '🔓', title: 'Liberar Turno', class: 'btn-liberar' }
            ];
        default:
            return [];
    }
}

const turnoController = {
    async getAll(req, res) {
        const turnos = await Turno.findAll();
        res.json(turnos);
    },
    async getById(req, res) {
        const turno = await Turno.findById(req.params.id);
        res.json(turno);
    },
    async create(req, res) {
        const id = await Turno.create(req.body);
        res.json({ id });
    },
    async update(req, res) {
        await Turno.update(req.params.id, req.body);
        res.json({ message: 'Turno actualizado' });
    },
    async delete(req, res) {
        await Turno.delete(req.params.id);
        res.json({ message: 'Turno eliminado' });
    },
    async turnosLibres(req, res) {
        const turnosLibres = await Turno.turnosLibres(req.params.id);
        res.json(turnosLibres);
    },
    async turnosReservados(req, res) {
        const turnosReservados = await Turno.turnosReservados(req.params.id);
        res.json(turnosReservados);
    },
    async agendarTurno(req, res) {
       await Turno.agendarTurno(req.params.id, req.body);
        res.json({ message: 'Turno agendado' });
    },
    async generarTurnos(req, res) {
        await Turno.generarTurnos(req.body);
        res.json({ message: 'Turnos generados' });
    },
    async crearSobreturno(req,res){
        try{
            await Turno.crearSobreturno(req.params.id, req.body);
            res.json({ message: 'Sobreturno agendado' });
        } catch (error){
            if (error.message.includes("Máximo de sobreturnos")) {
            return res.status(400).json({ message: error.message });
            } 
        }

    },
//    async turnosSinSobreturnoPorAgenda(req,res){
//        const idAgenda = req.params.idAgenda;
//        const data = req.body;
//        const turnos = await Turno.turnosSinSobreturnoPorAgenda(idAgenda,data);
//        res.json(turnos);
//    }
 async turnosSinSobreturnoPorAgenda(req,res){
       const idAgenda = req.params.idAgenda;
       const turnos = await Turno.turnosSinSobreturnoPorAgenda(idAgenda);
       res.json(turnos);
   },
    async sobreturnos(req,res){
       const idAgenda = req.params.idAgenda;
       const turnos = await Turno.sobreturnos(idAgenda);
       res.json(turnos);
   },
  async getDatosSecretaria(req) {
        try {
            const fecha = req.query.fecha || new Date().toISOString().slice(0, 10);
            const idMedico = req.query.idMedico && req.query.idMedico !== 'all' ? req.query.idMedico : null;
            const idEspecialidad = req.query.idEspecialidad && req.query.idEspecialidad !== 'all' ? req.query.idEspecialidad : null;
            const idEstadoTurno = req.query.idEstadoTurno && req.query.idEstadoTurno !== 'all' ? req.query.idEstadoTurno : null;
            const idSucursal = req.query.idSucursal && req.query.idSucursal !== 'all' ? req.query.idSucursal : null;

            const medicos = await MedicoEspecialidad.obtenerTodosMedicos();
            const estados = await Turno.findAllEstados();
            
            let especialidades = [];
            if (idMedico) {
                especialidades = await MedicoEspecialidad.obtenerEspecialidad(idMedico);
            } else {
                especialidades = await MedicoEspecialidad.obtenerTodasEspecialidades();
            }

            const turnos = await Turno.obtenerTurnosSecretaria({ 
                fecha, idMedico, idEspecialidad, idEstadoTurno, idSucursal 
            });

            turnos.forEach(t => {
                t.acciones = accionesPorEstado(t.idEstadoTurno);
            });

            return {
                medicos,
                especialidades,
                estados,
                turnos,
                filtros: { 
                    fecha, 
                    idMedico: req.query.idMedico || 'all', 
                    idEspecialidad: req.query.idEspecialidad || 'all',
                    idEstadoTurno: req.query.idEstadoTurno || 'all',
                    idSucursal: req.query.idSucursal || 'all' 
                }
            };
        } catch (error) {
            console.error('Error obteniendo datos secretaria:', error);
            throw error;
        }
    },
    async getDatosPaciente(req) {
        try {
            const idPersona = req.session.user.idPersona;
            
            const paciente = await Paciente.obtenerPacienteidPersona(idPersona);
            
            if (!paciente) {
                return { turnos: [] };
            }

            const idPaciente = paciente.pacienteID || paciente.ID;
            
            const turnos = await Turno.obtenerTurnosPaciente(idPaciente);

            turnos.forEach(t => {
                const d = new Date(t.fecha);
                const userTimezoneOffset = d.getTimezoneOffset() * 60000;
                const fechaCorrecta = new Date(d.getTime() + userTimezoneOffset);
                
                t.fechaFormateada = fechaCorrecta.toLocaleDateString('es-AR');
            });

            return { turnos };

        } catch (error) {
            console.error('Error obteniendo datos paciente:', error);
            throw error;
        }
    },

    async cambiarEstado(req, res) {
        try {
            const idTurno = req.params.id;
            const { idEstadoTurno, tipo } = req.body;
            await Turno.cambiarEstado(idTurno, idEstadoTurno,tipo);
            res.redirect('back');
        } catch (error) {
            console.error(error);
            res.status(500).send('Error al cambiar estado');
        }
    }
};

module.exports = turnoController;
