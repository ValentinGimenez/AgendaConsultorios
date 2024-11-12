//const { on } = require("nodemon");

document.addEventListener('DOMContentLoaded', async () => {
    //<a href="/addhorario/id" id="btnAgregarHorario">Agregar Horario</a>
    //app.get('/Horario/:id', (req, res) => {
    //res.render('agregar-horario', { id}); // Pasa el ID a la vista
    //});  
     // id del medico

    const btnAgregarHorario = document.getElementById('agregarHorario');
    const formHorario = document.getElementById('formHorario');
    const selectSucursal = document.getElementById('sucursal');
    const url = window.location.href;
    const match = url.match(/\/medico\/(\d+)/);
    const idMedico = match ? match[1] : null;

    console.log(idMedico); 
    // const select = new MultiSelectTag('semana',{
    //     onchange: function(){
    //         obtenerSelectSemana();
    //     }
    // });

    //semana es de seleccion multiple
//    const selectSemana = document.getElementById('semana');

    const selectEspecialidad = document.getElementById('especialidad');
    const sobreTurnoMax=2;


// Función para obtener la especialidad seleccionada
const obtenerEspecialidadSeleccionada = () => {
    const especialidad = selectEspecialidad;
    console.log('"id medico_especialidad":', especialidad);
    return especialidad;
};

// Función para obtener la sucursal seleccionada
const obtenerSucursalSeleccionada = () => {
    const idSucursal = selectSucursal.value;
    return idSucursal;
};

// Función para obtener los días de la semana seleccionados
const obtenerSelectSemana = () => {
    const checkboxes = document.querySelectorAll('input[name="dia"]:checked');
    const diasSeleccionados = Array.from(checkboxes).map(checkbox => checkbox.value);
    console.log('Días seleccionados:', diasSeleccionados);
    return diasSeleccionados;
};




    ///////////////////////////////////
    selectSucursal.addEventListener('change', obtenerSucursalSeleccionada);
    // selectSemana.addEventListener('change', obtenerSelectSemana);
    //select.addEventListener('change', obtenerSelectSemana);
    selectEspecialidad.addEventListener('change', obtenerEspecialidadSeleccionada);

    btnAgregarHorario.addEventListener('click', async function (event) {
    
        const semana = obtenerSelectSemana();
        const idSucursal = obtenerSucursalSeleccionada();
        const especialidad = obtenerEspecialidadSeleccionada();
        const idMedico_especialidad = especialidad.value;
        const duracionTurno = document.getElementById('duracionTurno').value;
        const fecha_init = document.getElementById('fecha_inicio').value;
        const fecha_fin = document.getElementById('fecha_fin').value;
        const hora_inicio = document.getElementById('hora_inicio').value;
        const hora_fin = document.getElementById('hora_fin').value;
    
        const hoy = new Date();
        const dosMesesDespues = new Date();
        dosMesesDespues.setMonth(hoy.getMonth() + 2);
        
        const formatoFecha = (fecha) => {
            const dia = String(fecha.getDate()).padStart(2, '0');
            const mes = String(fecha.getMonth() + 1).padStart(2, '0'); 
            const anio = fecha.getFullYear();
            return `${anio}-${mes}-${dia}`;
        };
    
        document.getElementById('fecha_inicio').min = formatoFecha(hoy);
        document.getElementById('fecha_inicio').max = formatoFecha(dosMesesDespues);
        
        const fechaInicio = new Date(fecha_init);
        const fechaFin = new Date(fecha_fin);
    
        if (!fecha_init || !fecha_fin) {
            alert('Por favor, selecciona una fecha de inicio y de fin.');
            return;
        }
    
        if (fechaFin < fechaInicio) {
            alert('La fecha de fin no puede ser menor que la fecha de inicio.');
            return;
        }
    
        const horaInicioArray = hora_inicio.split(':');
        const horaFinArray = hora_fin.split(':');
        const horaInicioDate = new Date(fecha_init);
        const horaFinDate = new Date(fecha_init);
    
        horaInicioDate.setHours(horaInicioArray[0], horaInicioArray[1], 0);
        horaFinDate.setHours(horaFinArray[0], horaFinArray[1], 0);
    
        if (horaFinDate <= horaInicioDate) {
            alert('La hora de fin no puede ser menor o igual a la hora de inicio.');
            return;
        }
    
        const diferenciaHoras = (horaFinDate - horaInicioDate) / (1000 * 60 * 60); 
        if (diferenciaHoras > 8) {
            alert('La duración entre la hora de inicio y la hora de fin no puede exceder las 8 horas.');
            return;
        }
    
        if (!duracionTurno) {
            alert('Por favor, ingresa una duración.');
            return;
        } else {
            const numero = parseInt(duracionTurno, 10);
            if (numero < 10 || numero > 60 || numero % 10 !== 0) {
                alert('Duración de turno debe ser de 10, 20, 30, 40, 50 o 60 minutos.');
                return;
            }
        }
    
        if (idSucursal === '-1') {
            alert('Por favor, selecciona una sucursal.');
            return;
        }
    
        if (idMedico_especialidad === '-1') {
            alert('Por favor, selecciona una especialidad.');
            return;
        }
    
        if (semana.length === 0) {
            alert("Seleccioná al menos un día de la semana.");
            return;
        }
    
        for (const dia of semana) {
            try {
                const agendaResponse = await fetch('/agenda/crearAgenda', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        idMedico_especialidad,
                        idSucursal,
                        diaSemana: dia,
                        duracionTurno,
                        sobreTurnoMax
                    }),
                });
    
                if (agendaResponse.ok) {
                    const agendaData = await agendaResponse.json();
                    const idAgenda = agendaData.id; 
    
                    console.log(`Agenda creada para ${dia}: ${idAgenda}`);
    
                    const horarioResponse = await fetch('/horario/crearHorario', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            fecha_inicio: fecha_init,
                            fecha_fin: fecha_fin,
                            hora_inicio: hora_inicio,
                            hora_fin: hora_fin,
                            estado: "libre",
                            idAgenda
                        }),
                    });
    
                    if (horarioResponse.ok) {
                        console.log(`Horario registrado exitosamente para ${dia}`);
                        
                        const turnoResponse = await fetch("/turno/generarTurnos", {
                            method: 'POST', 
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                idAgenda,
                                hora_inicio,
                                hora_fin,
                                fecha_inicio: fecha_init,
                                fecha_fin: fecha_fin,
                                diaSemana: dia, 
                                duracionTurno,
                                sobreTurnoMax
                            })
                        });
    
                        if (turnoResponse.ok) {
                            const turnoData = await turnoResponse.json();
                            console.log(`Turnos generados para ${dia}:`, turnoData);
                        } else {
                            alert(`Error al generar turnos para ${dia}`);
                        }
    
                    } else {
                        alert(`Error al registrar el horario para ${dia}`);
                    }
                } else {
                    alert(`Error al crear la agenda para ${dia}`);
                }
            } catch (error) {
                console.error(`Error procesando el día ${dia}:`, error);
            }
        }
    
        formHorario.reset(); 
        alert('Horario y turnos registrados exitosamente');
    });
    //cargar select de especialidades
    const cargarSelectEspecialidades = async (idMedico) => {
        const especialidades = await obtenerEspecialidades(idMedico);
        console.log("especialidades:",especialidades);
        selectEspecialidad.innerHTML = ''; 
        const option = document.createElement('option');
        option.textContent = '-- Seleccione una especialidad --';
        option.value=-1;
        option.disabled = true;
        option.selected = true; 
        selectEspecialidad.appendChild(option);
    
        especialidades.forEach(especialidad => {
            const option = document.createElement('option'); 
            option.value = especialidad.ID;
            console.log("option.value:",option.value);
            option.textContent = especialidad.nombre; 
            selectEspecialidad.appendChild(option);
        });
    }
     //cargar select de días de la semana

    //  const cargarSelectSemana = async () => {
    //     const semanas = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    //     selectSemana.innerHTML = ''; 
    //     // select.innerHTML = ''; 

    //     const option = document.createElement('option');
    //     option.textContent = '-- Seleccione el dia --';
    //     selectSemana.appendChild(option);
    //     // select.appendChild(option);

    
    //     semanas.forEach(semana => {
    //         const option = document.createElement('option'); 
    //         option.textContent = semana; 
    //         option.value = semana.toUpperCase();
    //         selectSemana.appendChild(option);
    //         // select.appendChild(option);

    //     });
    // }
    const cargarSucursalesSelect = async () => {
        const sucursalesDisponibles = await obtenerSucursales();
        console.log("sucursalesDisponibles:",sucursalesDisponibles);
        selectSucursal.innerHTML = '';
        const option = document.createElement('option');
        option.textContent = '-- Seleccione una sucursal --';
        option.value=-1;
        option.disabled = true; 
        option.selected = true;
        selectSucursal.appendChild(option);

        sucursalesDisponibles.forEach(sucursal => {
            const option = document.createElement('option');
            option.value = sucursal.ID;
            option.textContent = sucursal.nombre;
            selectSucursal.appendChild(option);
        });
    };
    cargarSucursalesSelect();
    // cargarSelectSemana();
    cargarSelectEspecialidades(idMedico);
    ////////////////////////
    async function obtenerEspecialidades(idMedico) {
        try {
            const response = await fetch(`/medico_especialidad/obtenerEspecialidad/${idMedico}`);
            if (!response.ok) {
                throw new Error('Error al obtener las especialidades');
            }
            const datos = await response.json();
            return datos;
        } catch (error) {
            console.error('Error al obtener las especialidades:', error);
            return null;
        }  
    }
    async function obtenerSucursales() {
        try {
            const response = await fetch('/sucursal/listarSucursales');
            if (!response.ok) {
                throw new Error('Error al obtener las sucursales');
            }
            const datos = await response.json();
            return datos;
        } catch (error) {
            console.error('Error al obtener las sucursales:', error);
            return null;
        }
    }
})