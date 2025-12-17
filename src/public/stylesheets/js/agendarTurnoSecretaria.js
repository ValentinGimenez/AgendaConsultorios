document.addEventListener('DOMContentLoaded', function () {
  const calendarEl = document.getElementById('calendar');
  const selectEspecialidad = document.getElementById('especialidad');
  const selectMedico = document.getElementById('medico');
  const selectSucursal = document.getElementById('sucursal');
  const limpiarbtn = document.getElementById('limpiarbtn');
  const divs = document.getElementById('available-times');

  let calendar;
  document.getElementById('agenda').style.display = 'none';
  document.getElementById('date-title').style.display = 'none';
  //limpiar Filtros
  limpiarbtn.addEventListener('click', () => {
    selectSucursal.value = -1;
    cargarSelectMedicos2();
    cargarSelectEspecialidades1();
    document.getElementById('agenda').style.display = 'none';
    if (divs) {
      divs.innerHTML = '';
    }

    if (calendar) {
      calendar.destroy();

    }
  })
  let valorMedicoSeleccionado = -1;
  let valorEspecialidadSeleccionada = -1;

  selectEspecialidad.addEventListener('change', async () => {
    if (selectEspecialidad.value != -1) {
      valorEspecialidadSeleccionada = selectEspecialidad.value;
      const idEspecialidad = selectEspecialidad.value;
      await cargarSelectMedicos1(idEspecialidad);
      selectMedico.value = valorMedicoSeleccionado;
      cargarDatosCalendario();
    } else {
      await cargarSelectMedicos2();
      selectMedico.value = valorMedicoSeleccionado;
    }
  })

 selectMedico.addEventListener('change', async () => {
  valorMedicoSeleccionado = selectMedico.value;
  if (selectMedico.value != -1) {
    cargarDatosCalendario();
  } else {
    if (calendar) calendar.destroy();
  }
});

  function obtenerDiasSemana(dataAgenda) {
    const diasSemana = [];

    dataAgenda.forEach(agenda => {
      if (agenda.dia_semana) {
        let diaNumerico;
        switch (agenda.dia_semana.toLowerCase()) {
          case 'lunes':
            diaNumerico = 1;
            break;
          case 'martes':
            diaNumerico = 2;
            break;
          case 'miercoles':
            diaNumerico = 3;
            break;
          case 'jueves':
            diaNumerico = 4;
            break;
          case 'viernes':
            diaNumerico = 5;
            break;
          case 'sabado':
            diaNumerico = 6;
            break;
          default:
            diaNumerico = -1;
            break;
        }

        if (diaNumerico !== -1) {
          diasSemana.push(diaNumerico);
        }
      }

    });
    console.log("AGENDA", dataAgenda)
    return diasSemana;
  }
  let diasemanas;
  let turnosDisponibles;
  let turnosReservados = [];
  async function obtenerTurnosLibres(dataAgenda) {
    const turnosLibres = [];
    for (const agenda of dataAgenda) {
      const idAgenda = agenda.ID;
      const response = await fetch(`/turno/turnosLibres/${idAgenda}`);
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          turnosLibres.push(data);

        }
      } else {
        console.error(`Error al obtener turnos libres para la agenda con id ${idAgenda}:`, response.status);
      }
    }
    return turnosLibres;
  }
  async function obtenerTurnosReservados(dataAgenda) {
    const turnosRes = [];
    for (const agenda of dataAgenda) {
      const idAgenda = agenda.ID;
      const response = await fetch(`/turno/turnosSinSobreturno/${idAgenda}`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fecha: selectedDate,
          hora_inicio: turno.hora_inicio
        })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          turnosRes.push(data);
        }
      } else {
        console.error(`Error al obtener turnos reservados para la agenda con id ${idAgenda}:`, response.status);
      }
    }
    return turnosRes;
  }
  let medico_especialidad;


  let sucursalesPorAgenda = {};
  async function cargarDatosCalendario() {

    const idSucursal = selectSucursal.value;
    const idEspecialidad = selectEspecialidad.value;
    const idMedico = selectMedico.value;

     if (idSucursal == -1 || idEspecialidad == -1 || idMedico == -1) return;

    const medicoTxt = selectMedico.options[selectMedico.selectedIndex]?.textContent || '';
    const sucursalTxt = selectSucursal.options[selectSucursal.selectedIndex]?.textContent || '';
    const especialidadTxt = selectEspecialidad.options[selectEspecialidad.selectedIndex]?.textContent || '';

    //obtener turnos 
    const resp = await fetch(`/turno/turnosDisponibles/${idSucursal}/${idEspecialidad}/${idMedico}`);
    if (!resp.ok) {
      console.error('Error turnosDisponibles', resp.status);
      return;
    }
     const rows = await resp.json();
     turnosDisponibles = [rows];

      const agendasIds = [...new Set(rows.map(t => t.idAgenda))];
      if (rows.length === 0) {
        alert("Sin turnos disponibles");
        if (divs) divs.innerHTML = '';
        document.getElementById('agenda').style.display = 'none';
        document.getElementById('date-title').style.display = 'none';
        if (calendar) calendar.destroy();
        return;
      }
      diasemanas = [...new Set(rows.map(t => new Date(t.fecha).getUTCDay()))].sort();
      sucursalesPorAgenda = {};
      for (const idA of agendasIds) {
        sucursalesPorAgenda[idA] = { nombre: sucursalTxt, direccion: '' };
      }
      turnosReservados = await obtenerTurnosConSobreturno(agendasIds);
      sobreturnos = await obtenerSobreturnos(agendasIds);
      
      const maxSobreturnoPorAgenda = {};
      agendasIds.forEach(idA => maxSobreturnoPorAgenda[idA] = 0);

      document.getElementById('date-title').style.display = 'flex';
      if (calendar) {
        calendar.destroy();
        document.getElementById('agenda').style.display = 'none';
      }
      
      document.getElementById('agenda').style.display = 'flex';
      const agenda = document.getElementById('agenda-medico');
      const agendaE = document.getElementById('agenda-especialidad');

      agenda.style.display = 'flex';
      agenda.innerHTML = `Agenda de &nbsp;<strong>${medicoTxt}</strong>`;

      agendaE.style.display = 'flex';
      agendaE.innerHTML = `Especialidad: ${especialidadTxt}`;

      crearCalendario(diasemanas, turnosDisponibles, turnosReservados, sobreturnos, maxSobreturnoPorAgenda);


    // if (selectEspecialidad.value != -1 && selectMedico.value != -1) {

     
    //   const idEspecialidad = selectEspecialidad.value;
    //   const idMedico = selectMedico.value;
    //   const medico = selectMedico.options[selectMedico.selectedIndex];
    //   const especialidad = selectEspecialidad.options[selectEspecialidad.selectedIndex];

    //   const response = await fetch(`/medico_especialidad/obtenerId/${idMedico}/${idEspecialidad}`);
    //   if (response.ok) {
    //     medico_especialidad = await response.json();
    //     const idMedicoEspecialidad = medico_especialidad.id;
    //     //obtener la agenda
    //     const responseAgenda = await fetch(`/agenda/obtenerAgendas/${idMedicoEspecialidad}`);
    //     if (responseAgenda.ok) {
    //       const dataAgenda = await responseAgenda.json();
    //       sucursalesPorAgenda = {};
    //       dataAgenda.forEach(a => {
    //         sucursalesPorAgenda[a.ID] = {
    //           nombre: a.sucursalNombre,
    //           direccion: a.sucursalDireccion
    //         };
    //       });
    //       console.log("dataAgenda", dataAgenda);
    //       if (dataAgenda.length > 0) {

    //         diasemanas = obtenerDiasSemana(dataAgenda);
    //         console.log("DIAS SEMANA: ", diasemanas);
    //         //obtener los turnos
    //         turnosDisponibles = await obtenerTurnosLibres(dataAgenda);
    //         //turnosReservados = await obtenerTurnosReservados(dataAgenda);
    //         turnosReservados = await obtenerTurnosConSobreturno(dataAgenda); //turnos reservados de tipo normales
    //         //traer todos los sobreturnos
    //         sobreturnos = await obtenerSobreturnos(dataAgenda);

    //         console.log("TURNOS DISPONIBLES: ", turnosDisponibles);
    //         console.log("TURNOS RESERVADOS: ", turnosReservados);
    //         console.log("SOBRETURNOS: ", sobreturnos);

    //         //mapeo de sobreturnos max por agenda del medico
    //         const maxSobreturnoPorAgenda = {};
    //         dataAgenda.forEach(a => {
    //           maxSobreturnoPorAgenda[a.ID] = a.sobreturnoMax;
    //         })

    //         if (turnosDisponibles.length > 0 || turnosReservados.length > 0) {
    //           document.getElementById('date-title').style.display = 'flex';

    //           if (calendar) {
    //             calendar.destroy();
    //             document.getElementById('agenda').style.display = 'none';
    //           }
    //           const agenda = document.getElementById('agenda-medico');
    //           const agendaE = document.getElementById('agenda-especialidad');
    //           document.getElementById('agenda').style.display = 'flex';


    //           agenda.style.display = 'flex';
    //           agenda.innerHTML = `Agenda de  &nbsp;<strong> ${medico.textContent} </strong>`;
    //           agendaE.style.display = 'flex';
    //           agendaE.innerHTML = "  Especialidad: " + especialidad.textContent;

    //           crearCalendario(diasemanas, turnosDisponibles, turnosReservados, sobreturnos, maxSobreturnoPorAgenda);
    //         } else {
    //           alert("Sin turnos disponibles");
    //           if (divs) {
    //             divs.innerHTML = '';
    //           }
    //           document.getElementById('agenda').style.display = 'none';
    //           document.getElementById('date-title').style.display = 'none';
    //           if (calendar) {
    //             calendar.destroy();
    //           }
    //         }


    //       } else {
    //         alert('Sin agendas disponibles');
    //         //importante si
    //         if (divs) {
    //           divs.innerHTML = '';
    //         }
    //         document.getElementById('agenda').style.display = 'none';
    //         document.getElementById('date-title').style.display = 'none';
    //         if (calendar) {
    //           calendar.destroy();
    //         }

    //       }
    //     }

    //   } else {
    //     console.error("Error al obtener el ID de Médico y Especialidad:", response.status);
    //   }

    // }
  }
  //medicos de la especialidad seleccionada
  const cargarSelectMedicos1 = async (idEspecialidad) => {
    const medicos = await obtenerTodosLosMedicos(idEspecialidad);
    selectMedico.innerHTML = '';
    const option = document.createElement('option');
    option.value = -1;
    option.textContent = 'Seleccione un medico';
    option.disabled = true;
    option.selected = true;
    selectMedico.appendChild(option);

    medicos.forEach(medico => {
      const option = document.createElement('option');
      option.value = medico.medico_id;
      option.textContent = medico.nombre_completo;
      selectMedico.appendChild(option);
    });

  }
  async function onFiltroCambio() {
    const idSucursal = selectSucursal.value;
    const idEspecialidad = selectEspecialidad.value;
    if (idSucursal == -1 || idEspecialidad == -1) {
      await cargarSelectMedicos2();
      if (calendar) calendar.destroy();
      return;
    }
    if (valorMedicoSeleccionado != -1) selectMedico.value = valorMedicoSeleccionado;

    cargarDatosCalendario();

    await cargarSelectMedicosPorSucursalEspecialidad(idSucursal, idEspecialidad);
  }
  selectSucursal.addEventListener('change', onFiltroCambio);
  selectEspecialidad.addEventListener('change', onFiltroCambio);
  //todos los médicos 
  const cargarSelectMedicos2 = async () => {
    const medicos = await obtenerMedicos();
    selectMedico.innerHTML = '';
    const option = document.createElement('option');
    option.value = -1;
    option.textContent = 'Seleccione un medico';
    option.disabled = true;
    option.selected = true;
    selectMedico.appendChild(option);
    medicos.forEach(medico => {
      const option = document.createElement('option');
      option.value = medico.medico_id;
      option.textContent = `${medico.nombre_completo}`;
      selectMedico.appendChild(option);
    });

  }
  const cargarSelectEspecialidades1 = async () => {
    //obtener todas las especialidades
    const especialidades = await obtenerTodasLasEspecialidades();
    console.log("AQUIIII especialidades:", especialidades);
    selectEspecialidad.innerHTML = '';
    const option = document.createElement('option');
    option.value = -1;
    option.textContent = '-- Seleccione una especialidad --';
    option.disabled = true;
    option.selected = true;
    selectEspecialidad.appendChild(option);

    especialidades.forEach(especialidad => {

      const option = document.createElement('option');
      option.value = especialidad.especialidad_id;
      option.textContent = especialidad.nombre;
      selectEspecialidad.appendChild(option);
    });

  }
  const cargarSelectEspecialidades2 = async (idMedico) => {
    const especialidades = await obtenerEspecialidades(idMedico);
    selectEspecialidad.innerHTML = '';
    const option = document.createElement('option');
    option.value = -1;
    option.textContent = 'Seleccione una especialidad';
    option.disabled = true;
    option.selected = true;
    selectEspecialidad.appendChild(option);

    especialidades.forEach(especialidad => {
      const option = document.createElement('option');
      console.log("ID especialidad:", especialidad.idEspecialidad);
      option.value = especialidad.idEspecialidad;
      option.textContent = especialidad.nombre;
      selectEspecialidad.appendChild(option);
    });

  }

  cargarSelectMedicos2();
  cargarSelectEspecialidades1();


  //obtener los datos de la base de datos 
  //medicos
  async function obtenerTodosLosMedicos(idEspecialidad) {
    try {
      const response = await fetch(`/medico_especialidad/obtenerMedicosActivos/${idEspecialidad}`);
      if (!response.ok) {
        throw new Error('Error al obtener los medicos');
      }
      const datos = await response.json();
      console.log("id especialidad:", idEspecialidad);
      console.log("datos:", datos);
      return datos;
    } catch (error) {
      console.error('Error al obtener los medicos:', error);
      return null;
    }
  }
  async function obtenerMedicos() {
    //en vez de traer a los médicos de medico debería traer los médicos de medico_especialidad
    try {
      const response = await fetch(`/medico_especialidad/obtenerTodosMedicos`);
      if (!response.ok) {
        throw new Error('Error al obtener los medicos');
      }
      const datos = await response.json();
      return datos;
    } catch (error) {
      console.error('Error al obtener los medicos:', error);
      return null;
    }
  }
  //especialidades
  async function obtenerTodasLasEspecialidades() {
    try {
      const response = await fetch(`/medico_especialidad/obtenerTodasEspecialidades`);
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
  //

  ////fullcalendar 
  function crearCalendario(DiasSemana, turnosLibres, turnosReservados, sobreturnos, maxSobreturnoPorAgenda) {
    let selectedDayEl = null;
    //configuración del calendario
    calendar = new FullCalendar.Calendar(calendarEl, {
      locale: 'es',
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next,today',
        center: 'title',
        right: ''
      },

      businessHours: {
        daysOfWeek: DiasSemana,
      },
      validRange: {
        start: new Date()
      },
      dayCellDidMount: function (info) {
        const today = new Date();
        const currentDate = today.setHours(0, 0, 0, 0);

        //Manejo de días habilitados
        if (info.date >= currentDate && DiasSemana.includes(info.date.getUTCDay())) {
          info.el.style.cursor = 'pointer';
          info.el.style.backgroundColor = '#E0F7FA'; // Color de fondo para días habilitados

          // Verifica si hay turnos disponibles para la fecha
          const selectedDate = info.date ? info.date.toISOString().split('T')[0] : null;
          const horariosDisponibles = [];
          const horariosOcupados = [];

          //mappear sobreturnos por fecha
          const sobreturnosPorFecha = new Map();
          for (const t of sobreturnos) {
            const fechaFormat = new Date(t.fecha).toISOString().split('T')[0];
            const key = `${t.idAgenda}|${fechaFormat}`;
            sobreturnosPorFecha.set(key, (sobreturnosPorFecha.get(key) || 0) + 1);
          }
          //mapear sobreturnos por hora (para cuando ya hay sobreturno en ese horario)
          const sobreturnoPorHorario = new Set();
          for (const t of sobreturnos) {
            const fechaFormat = new Date(t.fecha).toISOString().split('T')[0];
            sobreturnoPorHorario.add(`${t.idAgenda}|${fechaFormat}|${t.hora_inicio}`);
          }

          // obtener horarios disponibles del día, del array tunosLibres
          turnosLibres.forEach(turno => {
            turno.forEach(data => {
              const turnoFecha = new Date(data.fecha);
              const fechaFormat = turnoFecha.toISOString().split('T')[0];
              if (fechaFormat === selectedDate) {
                horariosDisponibles.push({
                  hora_inicio: data.hora_inicio,
                  id: data.ID,
                  idAgenda: data.idAgenda
                });
              }
            });
          });

          //obtener horarios ocupados del día, del array turnosReservados(normales)
          turnosReservados.forEach(data => {

            const turnoFecha = new Date(data.fecha);
            const fechaFormat = turnoFecha.toISOString().split('T')[0];
            if (fechaFormat === selectedDate) {
              horariosOcupados.push({
                hora_inicio: data.hora_inicio,
                id: data.ID,
                idAgenda: data.idAgenda
              });
            }

          })

          // Si no hay turnos disponibles, deshabilita la celda del calendario
          //if (horariosDisponibles.length === 0 && horariosOcupados.length === 0) {
          if (horariosDisponibles.length === 0 && horariosOcupados.length === 0) {

            info.el.style.pointerEvents = 'none'; // Desactiva la celda
            info.el.style.opacity = '0.5'; // Aplica un estilo visual para la celda inhabilitada
          } else {
            if (horariosDisponibles.length > 0) {
              info.el.style.position = 'relative';
              const cantidadTurnos = document.createElement('div');
              cantidadTurnos.className = 'turno-reservado';
              cantidadTurnos.textContent = horariosDisponibles.length;
              info.el.appendChild(cantidadTurnos);
            }
          }

          //elementos del modal
          // const especialidadSelect = selectEspecialidad;




          // Configura el evento de click para las celdas habilitadas
          info.el.addEventListener('click', function () {
            //if (horariosDisponibles.length > 0) {
            if (horariosDisponibles.length > 0 || horariosOcupados.length > 0) {
              // Remueve la clase del día previamente seleccionado
              if (selectedDayEl) {
                selectedDayEl.classList.remove('selected-day');
              }

              // Marca el día como seleccionado
              info.el.classList.add('selected-day');
              selectedDayEl = info.el;

              // Muestra las horas disponibles
              const availableTimesEl = document.getElementById('available-times');
              availableTimesEl.innerHTML = '';
              //ordenar los horarios libres y ocupados
              const horariosCombinados = [
                ...horariosDisponibles.map(t => ({ ...t, estado: "libre" })),
                ...horariosOcupados.map(t => ({ ...t, estado: "ocupado" }))
              ];
              horariosCombinados.sort((a, b) =>
                a.hora_inicio.localeCompare(b.hora_inicio)
              );
              //crear los botones para cada horario 
              horariosCombinados.forEach(turno => {

                //controlar que los sobreturnos max no superen el máximo
                const idAgenda = turno.idAgenda;
                const maxSobreturnos = maxSobreturnoPorAgenda[idAgenda] || 0;

                const keyDia = `${idAgenda}|${selectedDate}`;
                const usados = sobreturnosPorFecha.get(keyDia) || 0;
                const hayCupo = usados < maxSobreturnos;

                const keyHora = `${idAgenda}|${selectedDate}|${turno.hora_inicio}`;
                const yaTieneSobreturno = sobreturnoPorHorario.has(keyHora);
                console.log("keyDia:", keyDia, "usados:", usados, "max:", maxSobreturnos, "hayCupo:", hayCupo);
                console.log("sobreturnosPorFecha: ", sobreturnosPorFecha);
                //no mostrar turnos ocupados que ya tienen sobreturno
                if (turno.estado === "ocupado" && (!hayCupo || yaTieneSobreturno)) {
                  return;
                }

                const timeBtn = document.createElement("div");
                timeBtn.textContent = turno.hora_inicio;
                timeBtn.id = turno.id;

                if (turno.estado == "libre") {
                  timeBtn.className = "hora-disponible";
                  timeBtn.addEventListener("click", () => {
                    cargarDatosModal(turno, selectedDate, false);
                    abrirModal(turno.id, false);
                  })
                } else {//ocupados
                  const puedeSobreturno = hayCupo && !yaTieneSobreturno;

                  timeBtn.className = "hora-reservada";
                  timeBtn.addEventListener("click", () => {
                    cargarDatosModal(turno, selectedDate, true);
                    abrirModal(turno.id, true);
                  })

                }

                availableTimesEl.appendChild(timeBtn);
              });
            } else {
              alert(`No hay turnos disponibles para el día ${selectedDate}`);
            }
          });
        } else {
          // Deshabilita los días de fin de semana o fuera de los horarios permitidos
          info.el.style.pointerEvents = 'none';
          info.el.style.opacity = '0.5';
        }
      }

    });
    calendar.render();
  }

  //modal para agendar turno
  let confirmado = false;

  const modal = document.getElementById('turnoModal');
  const btnConfirmar = document.getElementById('confirmar');
  const btnCerrar = document.getElementById('cerrarModal');


  async function abrirModal(id_turno, esSobreturno) {
    const url = window.location.href;
    const match = url.match(/\/(\d+)\/agendarTurno/);
    const idPaciente = match ? match[1] : null;

    modal.style.display = 'flex';
    confirmado = false;
    btnConfirmar.disabled = false;
    btnConfirmar.textContent = 'Confirmar';
    btnCerrar.classList.remove('hidden');



    btnCerrar.onclick = null;
    btnConfirmar.onclick = null;

    btnConfirmar.onclick = async () => {

      if (confirmado) return;

      confirmado = true;
      btnConfirmar.disabled = true;
      btnConfirmar.textContent = 'Confirmando...';
      btnCerrar.classList.add('hidden');

      const motivo = document.getElementById('motivoConsulta').value.trim();


      if (esSobreturno) {
        await asignarSobreturno(idPaciente, id_turno, motivo);
      } else {
        await asignarTurno(idPaciente, id_turno, motivo);
      }

      alert(esSobreturno ? "Sobreturno confirmado" : "Turno confirmado");

      if (divs) {
        divs.innerHTML = '';
      }

      await cargarDatosCalendario();
      cerrarModal();
    }

    btnCerrar.onclick = () => {
      cerrarModal();
    }

  }


  function cerrarModal() {
    document.getElementById('turnoModal').style.display = 'none';
    confirmado = false;
    btnConfirmar.disabled = false;
    btnConfirmar.textContent = 'Confirmar';

  }

  const doctorInput = document.getElementById('doctor');
  const sucursalInput = document.getElementById('sucursal');
  const especialidadInput = document.getElementById('especialidadDoctor');
  const horarioInput = document.getElementById('horario');
  const fechaInput = document.getElementById('fecha');
  const motivoConsultaInput = document.getElementById('motivoConsulta');
  const tituloModal = document.getElementById("modal-header");

  function cargarDatosModal(turno, selectedDate, esSobreturno) {

    const medico = selectMedico.options[selectMedico.selectedIndex];
    const especialidad = selectEspecialidad.options[selectEspecialidad.selectedIndex];

    console.log(turno);
    doctorInput.textContent = medico.textContent;
    especialidadInput.textContent = especialidad.textContent;
    horarioInput.textContent = turno.hora_inicio;

    fechaInput.textContent = selectedDate;

    const sucursalData = sucursalesPorAgenda[turno.idAgenda];
    sucursalInput.textContent = sucursalData ? sucursalData.nombre : '';

    if (motivoConsultaInput) motivoConsultaInput.value = '';

    if (tituloModal) {
      tituloModal.textContent = esSobreturno
        ? 'Confirmación de sobreturno'
        : 'Confirmación de turno';
    }
  }

  async function asignarSobreturno(idPaciente, id_turno, motivoConsulta) {
    try {
      const response = await fetch(`/turno/crearSobreturno/${id_turno}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idPaciente, motivoConsulta
        }),
      });
      if (!response.ok) {
        alert(data.message);
        console.log(data);
      }
      else if (response.ok) {
        const data = await response.json();
        console.log(data);
      }
    } catch (error) {
      console.log("no se pudo asignar sobreturno");
    }
  }



  async function asignarTurno(idPaciente, id_turno, motivoConsulta) {
    try {
      console.log("idPaciente", idPaciente);
      console.log("id_turno", id_turno);
      const response = await fetch(`/turno/asignarTurno/${id_turno}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idPaciente, motivoConsulta
        }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log(data);
      }
    } catch (error) {
      console.log("no se pudo asignar turno");
    }
  }

  async function obtenerTurnosConSobreturno(dataAgenda) {
    const sobreturnos = [];

    for (const agenda of dataAgenda) {
      const response = await fetch(`/turno/turnosSinSobreturno/${agenda.ID}`);

      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) sobreturnos.push(...data);
      }
    }

    return sobreturnos;
  }
  async function obtenerSobreturnos(dataAgenda) {
    const sobreturnos = [];

    for (const agenda of dataAgenda) {
      const response = await fetch(`/turno/obtenerSobreturnos/${agenda.ID}`);

      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) sobreturnos.push(...data);
      }
    }

    return sobreturnos;
  }
















});