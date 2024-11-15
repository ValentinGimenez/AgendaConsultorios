
document.addEventListener('DOMContentLoaded', async () => {
    const hoy = new Date();
    const dosMesesDespues = new Date();
    dosMesesDespues.setMonth(hoy.getMonth() + 2);
    const seisMesesDespues = new Date();
    seisMesesDespues.setMonth(hoy.getMonth() + 6);

    const formatoFecha = (fecha) => {
        const dia = String(fecha.getDate()).padStart(2, '0');
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const anio = fecha.getFullYear();
        return `${anio}-${mes}-${dia}`;
    };

    document.getElementById('fecha_inicio').min = formatoFecha(hoy);
    document.getElementById('fecha_fin').min = formatoFecha(hoy);
    document.getElementById('fecha_fin').max = formatoFecha(seisMesesDespues);
    document.getElementById('fecha_inicio').max = formatoFecha(seisMesesDespues);


    const btnAgregarHorario = document.getElementById('agregarHorario');
    const formHorario = document.getElementById('formHorario');
    const selectSucursal = document.getElementById('sucursal');
    const url = window.location.href;
    const match = url.match(/\/medico\/(\d+)/);
    const idMedico = match ? match[1] : null;

    const selectEspecialidad = document.getElementById('especialidad');
    const sobreTurnoMax = 2;

    const obtenerEspecialidadSeleccionada = () => {
        const especialidad = selectEspecialidad;
        console.log('"id medico_especialidad":', especialidad);
        return especialidad;
    };

    const obtenerSucursalSeleccionada = () => {
        const idSucursal = selectSucursal.value;
        return idSucursal;
    };

    const obtenerSelectSemana = () => {
        const checkboxes = document.querySelectorAll('input[name="dia"]:checked');
        const diasSeleccionados = Array.from(checkboxes).map(checkbox => checkbox.value);
        return diasSeleccionados;
    };

    ///////////////////////////////////
    selectSucursal.addEventListener('change', obtenerSucursalSeleccionada);
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

        const hoy = new Date(); // Obtén la fecha actual

        // 1. Validaciones de campos requeridos y formato
        if (!idMedico_especialidad || idMedico_especialidad === '-1') {
            alert('Seleccione una especialidad.');
            return;
        }

        if (!idSucursal || idSucursal === '-1') {
            alert('Seleccione una sucursal.');
            return;
        }

        if (!duracionTurno || duracionTurno < 10 || duracionTurno > 60 || duracionTurno % 10 !== 0) {
            alert('La duración del turno debe ser de 10, 20, 30, 40, 50 o 60 minutos.');
            return;
        }

        if (semana.length === 0) {
            alert("Seleccione al menos un día de la semana.");
            return;
        }

        // 2. Validación de fechas
        if (!fecha_init || !fecha_fin) {
            alert('Seleccione una fecha.');
            return;
        }

        const fechaInicio = new Date(fecha_init);
        const fechaFin = new Date(fecha_fin);

        if (fechaFin < fechaInicio) {
            alert('La fecha de fin no puede ser menor que la fecha de inicio.');
            return;
        }

        if (fechaFin < hoy) {
            alert('La fecha de fin no puede ser anterior al día de hoy.');
            return;
        }

        const diferenciaEnMilisegundos = fechaFin - fechaInicio;
        const diferenciaEnDias = diferenciaEnMilisegundos / (1000 * 60 * 60 * 24);

        if (diferenciaEnDias > 60) {
            alert('El intervalo entre la fecha de inicio y la fecha de fin no puede exceder los 2 meses.');
            return;
        }

        // 3. Validación de horarios
        if (!hora_inicio || !hora_fin) {
            alert('Selecciona un horario.');
            return;
        }

        // Verificar que las horas sean múltiplos de 10 minutos
        const validarHora = (hora) => {
            const [horas, minutos] = hora.split(':').map(Number);
            return minutos % 10 === 0;
        };

        if (!validarHora(hora_inicio)) {
            alert('La hora de inicio debe ser un múltiplo de 10 minutos.');
            return;
        }

        if (!validarHora(hora_fin)) {
            alert('La hora de fin debe ser un múltiplo de 10 minutos.');
            return;
        }

        // Convertir las horas y fechas para comparar correctamente
        const horaInicioArray = hora_inicio.split(':');
        const horaFinArray = hora_fin.split(':');
        const horaInicioDate = new Date(fecha_init);
        const horaFinDate = new Date(fecha_init);

        horaInicioDate.setHours(horaInicioArray[0], horaInicioArray[1], 0);
        horaFinDate.setHours(horaFinArray[0], horaFinArray[1], 0);

        // Ajustar la fecha de fin si es menor o igual que la de inicio (en caso de cruzar medianoche)
        if (horaFinDate <= horaInicioDate) {
            horaFinDate.setDate(horaFinDate.getDate() + 1); // Añadir un día
        }

        // Calcular la duración en minutos
        const diferenciaEnMilisegundosHoras = horaFinDate - horaInicioDate;
        const diferenciaEnMinutos = diferenciaEnMilisegundosHoras / (1000 * 60); // Convertir de milisegundos a minutos

        if (diferenciaEnMinutos < duracionTurno) {
            alert(`La duración entre la hora de inicio y la hora de fin debe ser al menos ${duracionTurno} minutos.`);
            return;
        }
        if (diferenciaEnMinutos > 480) { // 480 minutos = 8 horas
            alert('La duración entre la hora de inicio y la hora de fin no puede exceder las 8 horas laborales.');
            return;
        }

        // 4. Si todo es correcto, mostrar mensaje de validación exitosa
        alert("Validación exitosa. Los datos son correctos.");




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
                        semana: dia,
                        duracionTurno,
                        sobreTurnoMax
                    }),
                });

                if (agendaResponse.ok) {
                    const agendaData = await agendaResponse.json();
                    const idAgenda = agendaData.id;


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
            }
        }

        formHorario.reset();
        alert('Horario y turnos registrados exitosamente');
    });
    const cargarSelectEspecialidades = async (idMedico) => {
        const especialidades = await obtenerEspecialidades(idMedico);
        selectEspecialidad.innerHTML = '';
        const option = document.createElement('option');
        option.textContent = '-- Seleccione una especialidad --';
        option.value = -1;
        option.disabled = true;
        option.selected = true;
        selectEspecialidad.appendChild(option);

        especialidades.forEach(especialidad => {
            const option = document.createElement('option');
            option.value = especialidad.ID;
            option.textContent = especialidad.nombre;
            selectEspecialidad.appendChild(option);
        });
    }

    const cargarSucursalesSelect = async () => {
        const sucursalesDisponibles = await obtenerSucursales();
        selectSucursal.innerHTML = '';
        const option = document.createElement('option');
        option.textContent = '-- Seleccione una sucursal --';
        option.value = -1;
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