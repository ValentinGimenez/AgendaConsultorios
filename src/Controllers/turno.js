const Turno = require('../models/turno');

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
   }
};

module.exports = turnoController;
