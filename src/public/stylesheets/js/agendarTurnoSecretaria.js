document.addEventListener('DOMContentLoaded', function() {
    const calendarEl = document.getElementById('calendar');
    const selectEspecialidad = document.getElementById('especialidad');
    const selectMedico = document.getElementById('medico');
    const limpiarbtn = document.getElementById('limpiarbtn');
    let calendar;
    document.getElementById('agenda').style.display = 'none';
    document.getElementById('texto').style.display = 'none';
    document.getElementById('date-title').style.display = 'none';
    limpiarbtn.addEventListener('click', () => {
      cargarSelectMedicos2();
      cargarSelectEspecialidades1();
      document.getElementById('agenda').style.display = 'none';
      document.getElementById('texto').style.display = 'none'; 
      const divs = document.querySelectorAll('.hora-disponible');
            divs.forEach(div => {
              div.style.display = 'none'; 
            });
      if(calendar){
        calendar.destroy();
        
      }
    })
    let valorMedicoSeleccionado = -1; 
    let valorEspecialidadSeleccionada = -1;
    
    selectEspecialidad.addEventListener('change', async () => {
      if(selectEspecialidad.value != -1){
        valorEspecialidadSeleccionada = selectEspecialidad.value;
        const idEspecialidad = selectEspecialidad.value;
            await cargarSelectMedicos1(idEspecialidad);
        selectMedico.value = valorMedicoSeleccionado; 
        cargarDatosCalendario();       
      }else{
        await cargarSelectMedicos2();
        selectMedico.value = valorMedicoSeleccionado;
      }
    })

    selectMedico.addEventListener('change', async () => {
      if(selectMedico.value != -1){
        valorMedicoSeleccionado = selectMedico.value;
       
        const idMedico = selectMedico.value;
        await cargarSelectEspecialidades2(idMedico);
        selectEspecialidad.value = valorEspecialidadSeleccionada;
        cargarDatosCalendario();
      }else{
        await cargarSelectEspecialidades1();
        selectEspecialidad.value = valorEspecialidadSeleccionada;
      }
    })
    function obtenerDiasSemana(dataAgenda) {
      const diasSemana = [];
     
      dataAgenda.forEach(agenda => {
        if (agenda.dia_semana) {
          let diaNumerico;
          switch(agenda.dia_semana.toLowerCase()) {
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
    console.log("AGENDA",dataAgenda)
      return diasSemana;
  }
  let diasemanas;
  let turnosDisponibles;
  async function obtenerTurnosLibres(dataAgenda){
    const turnosLibres=[];
    for (const agenda of dataAgenda) {
      const idAgenda = agenda.ID;
      const response = await fetch(`/turno/turnosLibres/${idAgenda}`);
      if (response.ok) {
          const data = await response.json(); 
          if(data.length > 0){
          turnosLibres.push( data ); 
            
          }
      } else {
          console.error(`Error al obtener turnos libres para la agenda con id ${idAgenda}:`, response.status);
      }
    }
    return turnosLibres;
  }
  let medico_especialidad;

    // buscar.addEventListener('click', async () => {
    //   cargarDatosCalendario();
    // })
    let sucursalesPorAgenda = {}; 
   async function cargarDatosCalendario(){
      if(selectEspecialidad.value != -1 && selectMedico.value != -1){
             
        //importante
        const idEspecialidad = selectEspecialidad.value;
        const idMedico = selectMedico.value;
        const medico = selectMedico.options[selectMedico.selectedIndex];
        const especialidad = selectEspecialidad.options[selectEspecialidad.selectedIndex];

        const response = await fetch(`/medico_especialidad/obtenerId/${idMedico}/${idEspecialidad}`);
        if (response.ok) {
          medico_especialidad = await response.json();
          const idMedicoEspecialidad = medico_especialidad.id;
          //obtener la agenda
          const responseAgenda = await fetch(`/agenda/obtenerAgendas/${idMedicoEspecialidad}`);
             if (responseAgenda.ok) {
            const dataAgenda = await responseAgenda.json();
            sucursalesPorAgenda = {};
            dataAgenda.forEach(a => {
              sucursalesPorAgenda[a.ID] = {
                nombre: a.sucursalNombre,
                direccion: a.sucursalDireccion
              };
            });
            console.log("dataAgenda",dataAgenda);
              if(dataAgenda.length > 0){
                
                diasemanas = obtenerDiasSemana(dataAgenda);
                console.log("DIAS SEMANA: ", diasemanas);
                //obtener los turnos
                turnosDisponibles = await obtenerTurnosLibres(dataAgenda);
                console.log("TURNOS DISPONIBLES: ", turnosDisponibles);
                if(turnosDisponibles.length > 0){
                  document.getElementById('date-title').style.display = 'flex';  

                  if (calendar) {
                    calendar.destroy(); 
                    document.getElementById('agenda').style.display = 'none';
                    document.getElementById('texto').style.display = 'none'; 
                  }
                  const agenda = document.getElementById('agenda');
                  agenda.style.display = 'flex';
                  document.getElementById('texto').style.display = 'flex';
                  agenda.innerHTML = "Agenda de "+ medico.textContent + " Especialidad: " + especialidad.textContent;
                  
                  crearCalendario(diasemanas, turnosDisponibles);
                }else{
                  alert("Sin turnos disponibles");
                  const divs = document.querySelectorAll('.hora-disponible');
                  divs.forEach(div => {
                    div.style.display = 'none';  
                  });
                  document.getElementById('agenda').style.display = 'none';
                  document.getElementById('date-title').style.display = 'none'; 
                  if(calendar){
                    calendar.destroy(); 
                  }
                }
                
         
              }else{
                alert('Sin agendas disponibles');
               //importante si
                 const divs = document.querySelectorAll('.hora-disponible');
                divs.forEach(div => {
                  div.style.display = 'none';  
                });
                document.getElementById('agenda').style.display = 'none';
                document.getElementById('date-title').style.display = 'none'; 
                if(calendar){
                  calendar.destroy(); 
                }

              }
          }
            
        } else {
            console.error("Error al obtener el ID de Médico y Especialidad:", response.status);
        }

      }
    }
    //medicos de la especialidad seleccionada
    const cargarSelectMedicos1 = async (idEspecialidad) => {
      const medicos = await obtenerTodosLosMedicos(idEspecialidad);
      selectMedico.innerHTML = ''; 
      const option = document.createElement('option');
      option.value = -1; 
      option.textContent = '-- Seleccione un medico --';
      option.disabled = true;
      option.selected = true; 
      selectMedico.appendChild(option);
  
      medicos.forEach(medico => {
          const option = document.createElement('option'); 
          option.value = medico.medico_id;
          option.textContent = medico.nombre_completo; 
          selectMedico.appendChild(option);
      });
    //   $(selectmedico).select2({
    //     placeholder: '-- Seleccione un medico --',
    //     allowClear: true
    // });
    }
    //todos los médicos 
    const cargarSelectMedicos2 = async () => {
      const medicos = await obtenerMedicos();
      selectMedico.innerHTML = ''; 
      const option = document.createElement('option');
      option.value = -1; 
      option.textContent = '-- Seleccione un medico --';
      option.disabled = true;
      option.selected = true; 
      selectMedico.appendChild(option);
      medicos.forEach(medico => {
          const option = document.createElement('option'); 
          option.value = medico.medico_id;
          option.textContent = `${medico.nombre_completo}`; 
          selectMedico.appendChild(option);
      });
    //   $(selectMedico).select2({
    //     placeholder: '-- Seleccione un medico --',
    //     allowClear: true
    // });
    }
      const cargarSelectEspecialidades1 = async () => {
        //obtener todas las especialidades
        const especialidades = await obtenerTodasLasEspecialidades();
        console.log("AQUIIII especialidades:",especialidades);
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
      //   $(selectEspecialidad).select2({
      //     placeholder: '-- Seleccione una especialidad --',
      //     allowClear: true
      // });
    }
      const cargarSelectEspecialidades2 = async (idMedico) => {
        const especialidades = await obtenerEspecialidades(idMedico);
        selectEspecialidad.innerHTML = ''; 
        const option = document.createElement('option');
        option.value = -1; 
        option.textContent = '-- Seleccione una especialidad --';
        option.disabled = true;
        option.selected = true; 
        selectEspecialidad.appendChild(option);
    
        especialidades.forEach(especialidad => {
            const option = document.createElement('option'); 
            console.log("ID especialidad:",especialidad.idEspecialidad);
            option.value = especialidad.idEspecialidad;
            option.textContent = especialidad.nombre; 
            selectEspecialidad.appendChild(option);
        });
        // $(selectEspecialidad).select2({
        //   placeholder: '-- Seleccione una especialidad --',
        //   allowClear: true
      // });
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
            console.log("id especialidad:",idEspecialidad);
            console.log("datos:",datos);
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
 function crearCalendario(DiasSemana, turnosLibres) {
  let selectedDayEl = null;
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
    dayCellDidMount: function(info) {
      const today = new Date();
      const currentDate = today.setHours(0, 0, 0, 0);
    
      // Verifica si el día actual está habilitado
      if (info.date >= currentDate && DiasSemana.includes(info.date.getUTCDay())) {
        info.el.style.cursor = 'pointer';
        info.el.style.backgroundColor = '#E0F7FA'; // Color de fondo para días habilitados
    
        // Verifica si hay turnos disponibles para la fecha
        const selectedDate = info.date ? info.date.toISOString().split('T')[0] : null;
        const horariosDisponibles = [];
    
        // Filtra los turnos para la fecha seleccionada
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
    
        // Si no hay turnos disponibles, deshabilita la celda
        if (horariosDisponibles.length === 0) {
          info.el.style.pointerEvents = 'none'; // Desactiva la celda
          info.el.style.opacity = '0.5'; // Aplica un estilo visual para la celda inhabilitada
        }
    
        // Configura el evento de click para las celdas habilitadas
        info.el.addEventListener('click', function() {
          if (horariosDisponibles.length > 0) {
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
    
            // Crea los botones de horas disponibles
            
            horariosDisponibles.forEach(turno => {
              
             
                const timeBtn = document.createElement('div');
                timeBtn.className = 'hora-disponible';
                timeBtn.textContent = turno.hora_inicio;
                
                // Asignar un id único al timeBtn
                timeBtn.id = `${turno.id}`; 
                
                timeBtn.addEventListener('click', async function() {
                 // alert(`Has seleccionado la hora: ${turno.hora_inicio} para el día ${selectedDate}`);
                    //importante agregar los datos de sucursal
                    const medico = selectMedico.options[selectMedico.selectedIndex];
                    const especialidad = selectEspecialidad.options[selectEspecialidad.selectedIndex];
                    const doctorinput = document.getElementById('doctor');
                    const sucursalinput = document.getElementById('sucursal');
                    const especialidadinput = document.getElementById('especialidadDoctor');
                    const horarioinput = document.getElementById('horario');
                    const fechainput = document.getElementById('fecha');
                    doctorinput.textContent= medico.textContent;
                    //obtener la sucursal
                    const idAgenda= turno.idAgenda;
                    const sucursalData = sucursalesPorAgenda[idAgenda];
                    console.log("turno:", turno); 
                    //const idSucursal=turno.idSucursal
                   // const response = await fetch(`/sucursal/obtenerSucursal/${idAgenda}`);
                    //const sucu = await response.json();
                    sucursalinput.textContent= sucursalData.nombre;
                    especialidadinput.textContent= especialidad.textContent;
                    horarioinput.textContent= turno.hora_inicio;
                    fechainput.textContent= selectedDate;
                    const idTurno= timeBtn.id;
                  abrirModal( idTurno  );
                });
                
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
 
  //abrir modal

  async function abrirModal( id_turno ) {
    const url = window.location.href;
    const match = url.match(/\/(\d+)\/agendarTurno/);
    const idPaciente = match ? match[1] : null;
    
    console.log(idPaciente);
   
  document.getElementById('turnoModal').style.display = 'flex';
    document.getElementById('confirmar').addEventListener('click', async () => {
      asignarTurno(idPaciente, id_turno);
            alert("Turno confirmado");
            const divs = document.querySelectorAll('.hora-disponible');
            divs.forEach(div => {
              div.style.display = 'none'; 
            });
            cargarDatosCalendario();
            cerrarModal();
    })
    document.getElementById('cerrarModal').addEventListener('click', () => {
      cerrarModal();
    })
  }
  //cerrar modal 
  function cerrarModal() {
    document.getElementById('turnoModal').style.display = 'none';
  }
 
  
  async function asignarTurno(idPaciente, id_turno) {
    try {
      console.log("idPaciente", idPaciente);
      console.log("id_turno", id_turno);
      const response = await fetch(`/turno/asignarTurno/${id_turno}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            idPaciente
        }),
      });
      if(response.ok){
        const data = await response.json(); 
        console.log(data);
      }
    } catch (error) {
      console.log("no se pudo asignar turno");
    }
  }
  



  










    
  });