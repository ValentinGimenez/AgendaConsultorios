document.addEventListener('DOMContentLoaded', function() {
    const calendarEl = document.getElementById('calendar');
    const selectEspecialidad = document.getElementById('especialidad');
    const selectMedico = document.getElementById('medico');
    const limpiarbtn = document.getElementById('limpiarbtn');
    const buscar = document.getElementById('buscar');
    let calendar;
    document.getElementById('agenda').style.display = 'none';
    document.getElementById('texto').style.display = 'none';
    document.getElementById('date-title').style.display = 'none';
    // $(selectEspecialidad).select2({});
    // $(selectMedico).select2({});
    limpiarbtn.addEventListener('click', () => {
      cargarSelectMedicos2();
      cargarSelectEspecialidades1();
    })
    let valorMedicoSeleccionado = -1; 
    let valorEspecialidadSeleccionada = -1;
    
    selectEspecialidad.addEventListener('change', async () => {
      if(selectEspecialidad.value != -1){
        valorEspecialidadSeleccionada = selectEspecialidad.value;
        const idEspecialidad = selectEspecialidad.value;
            await cargarSelectMedicos1(idEspecialidad);
        selectMedico.value = valorMedicoSeleccionado;        
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
          turnosLibres.push( data ); 
      } else {
          console.error(`Error al obtener turnos libres para la agenda con id ${idAgenda}:`, response.status);
      }
    }
    return turnosLibres;
  }
  let medico_especialidad;

    buscar.addEventListener('click', async () => {
      cargarDatosCalendario();
    })
    
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
            console.log("dataAgenda",dataAgenda);
              if(dataAgenda.length > 0){
                document.getElementById('date-title').style.display = 'flex';  

                if (calendar) {
                  calendar.destroy(); 
                  document.getElementById('agenda').style.display = 'none';
                  document.getElementById('texto').style.display = 'none'; 
                }
                diasemanas = obtenerDiasSemana(dataAgenda);
                //obtener los turnos
                turnosDisponibles = await obtenerTurnosLibres(dataAgenda);
                const agenda = document.getElementById('agenda');
                agenda.style.display = 'flex';
                document.getElementById('texto').style.display = 'flex';
                agenda.innerHTML = "Agenda de "+ medico.textContent + " Especialidad: " + especialidad.textContent;

                crearCalendario(diasemanas, turnosDisponibles);
         
              }else{
                alert('Sin agendas disponibles');
               //importante si
                 const divs = document.querySelectorAll('.hora-disponible');
                divs.forEach(div => {
                  div.style.display = 'none';  // Esto los oculta
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
            option.value = especialidad.idEspecialidad;
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
            const response = await fetch(`/medico_especialidad/obtenerMedicos/${idEspecialidad}`);
            if (!response.ok) {
                throw new Error('Error al obtener los medicos');
            }
            const datos = await response.json();
            console.log("id especialidad:",idEspecialidad);
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
      right: 'dayGridMonth,dayGridDay'
    },
    
    businessHours: {
      // Define los días de la semana y horarios habilitados
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
                id: data.ID
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
              
            console.log("turno:", turno);
             
                const timeBtn = document.createElement('div');
                timeBtn.className = 'hora-disponible';
                timeBtn.textContent = turno.hora_inicio;
                
                // Asignar un id único al timeBtn
                timeBtn.id = `${turno.id}`; 
                
                timeBtn.addEventListener('click', function() {
                 // alert(`Has seleccionado la hora: ${turno.hora_inicio} para el día ${selectedDate}`);
                    //importante agregar los datos de sucursal
                    const medico = selectMedico.options[selectMedico.selectedIndex];
                    const especialidad = selectEspecialidad.options[selectEspecialidad.selectedIndex];
                    const doctorinput = document.getElementById('doctor');
                   // const sucursalinput = document.getElementById('sucursal');
                    const especialidadinput = document.getElementById('especialidadDoctor');
                    const horarioinput = document.getElementById('horario');
                    const fechainput = document.getElementById('fecha');
                    doctorinput.textContent= medico.textContent;
                   // sucursalinput.textContent= turno.sucu;
                    especialidadinput.textContent= especialidad.textContent;
                    horarioinput.textContent= turno.hora_inicio;
                    fechainput.textContent= selectedDate;
                    const idTurno= timeBtn.id;
                  abrirModal(turno.hora_inicio, idTurno, selectedDate );
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
  document.getElementById('confirmar').disabled=true;

   function abrirModal(hora_inicio, id_turno, fecha) {
  document.getElementById('turnoModal').style.display = 'flex';

    //Importante mostrar los datos dde la sucursal 
    document.getElementById('buscarDni').addEventListener('click', async () => {
      //validar que el campo no esté vacio
      const dni = document.getElementById('dni').value;
      let paciente;
      if(!dni){
        alert('El campo DNI no puede estar vacio');
        return;
      }
      if (!/^\d{8}$/.test(dni)) {
        alert('El DNI debe contener 8 dígitos.');
        document.getElementById('confirmar').disabled=true;

        return;
      }else{
         paciente = await buscarDni(dni);
         //paciente tiene personaID y pacienteID
        document.getElementById('confirmar').disabled=false;
      }


      document.getElementById('confirmar').addEventListener('click', async () => {
        let idPaciente;
        //validar formulario 
        const nombre= document.getElementById('nombre').value;
        const apellido=document.getElementById('apellido').value;
        const mail= document.getElementById('mail').value;
        const telefono=document.getElementById('telefono').value; 
        if(!nombre || !apellido || !mail || !telefono){
          alert('Todos los campos son obligatorios');
          return;
        }else{
          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailPattern.test(mail)) {
              alert('Por favor ingresa un email válido.');
              return;
          }else{
                //insertar o actualizar al paciente, obtener el id para poder actualizar el turno seleccionado 
            if(paciente!= null){
              //si hay paciente solo se tiene que actualizar los datos de persona y darle el turno al paciente
                actualizarPaciente(paciente,dni);
                idPaciente= paciente.pacienteID;
            }else{
              //si no hay paciente se tiene que insertar el paciente y darle el turno al paciente
              idPaciente =  await crearPaciente(dni);
            }
            if(idPaciente!=null){
              asignarTurno(idPaciente, id_turno);
              alert("Turno confirmado");
              //remover el div del horario correspondiente
              // const div = document.getElementById(id_turno);
              // div.remove();
              //esconder los div de la clase hora-disponible
              const divs = document.querySelectorAll('.hora-disponible');
              divs.forEach(div => {
                div.style.display = 'none';  // Esto los oculta
              });
              cargarDatosCalendario();
              cerrarModal();
              document.getElementById('nombre').value = "";
              document.getElementById('apellido').value = "";
              document.getElementById('mail').value = "";
              document.getElementById('telefono').value = "";
              document.getElementById('dni').value = "";
              document.getElementById('nombre').disabled = true;
              document.getElementById('apellido').disabled = true;
              document.getElementById('mail').disabled = true;
              document.getElementById('telefono').disabled = true;
              document.getElementById('confirmar').disabled = true;
            }
          }
        }
      })
    });
    document.getElementById('cerrarModal').addEventListener('click', () => {
      cerrarModal();
    })
  }
  //cerrar modal 
  function cerrarModal() {
    document.getElementById('turnoModal').style.display = 'none';
  }
 
  
 
  //buscar dni
  async function buscarDni(dni) {
    let persona;
    let paciente;
    //buscar en la base de datos los datos de la persona 
    try {
        const response = await fetch(`/persona/obtenerPersonaDni/${dni}`);
      if (!response.ok) {
          throw new Error('Error al obtener persona');
      }
       persona = await response.json();
    } catch (error) {
        console.error('Error al obtener persona:', error);
    };  
    //
    if(persona != null){
      //se encontro a la persona
      //buscar el paciente asociado a los datos de la persona
      try {
        const response = await fetch(`/paciente/obtenerPacienteidPersona/${persona.ID}`);
      if (!response.ok) {
          throw new Error('Error al obtener paciente');
      }
         paciente = await response.json();
         //paciente tiene personaID y pacienteID
      } catch (error) {
          console.error('Error al obtener paciente:', error);
      }  
      //LLENAR EL formulario
      document.getElementById('nombre').value = `${persona.nombre}`;
      document.getElementById('apellido').value = `${persona.apellido}`;
      document.getElementById('mail').value = `${persona.mail}`;
      document.getElementById('telefono').value = `${persona.telefono}`;
      document.getElementById('nombre').disabled = false;
      document.getElementById('apellido').disabled = false;
      document.getElementById('mail').disabled = false;
      document.getElementById('telefono').disabled = false;
    }else{
      //no se encontro a la persona
      document.getElementById('nombre').disabled = false;
      document.getElementById('apellido').disabled = false;
      document.getElementById('mail').disabled = false;
      document.getElementById('telefono').disabled = false;
      document.getElementById('nombre').value = "";
      document.getElementById('apellido').value = "";
      document.getElementById('mail').value = "";
      document.getElementById('telefono').value = "";
    }
    return paciente;
  }

  async function actualizarPaciente(paciente,dni) {
    const nombre = document.getElementById('nombre').value;
    const apellido = document.getElementById('apellido').value;
    const mail = document.getElementById('mail').value;
    const telefono = document.getElementById('telefono').value;
    const idPersona = paciente.personaID;
    console.log("HELLO idPersona", paciente);
    try {
      const response = await fetch(`/persona/updatePersona/${idPersona}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            nombre,
            apellido,
            mail,
            telefono,
            dni
        }),
      });
      if(response.ok){
        const data = await response.json(); 
        console.log(data);
      }
    } catch (error) {
      console.log("no se pudo actualizar persona");
    }
  }
  async function crearPaciente(dni){
    const nombre = document.getElementById('nombre').value;
    const apellido = document.getElementById('apellido').value;
    const mail = document.getElementById('mail').value;
    const telefono = document.getElementById('telefono').value;
    let idPersona;
    const obraSocial = 0;
    let idPaciente;
    try {
      const response = await fetch(`/persona/crearPersona`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            nombre,
            apellido,
            mail,
            telefono,
            dni
        }),
      });
      if(response.ok){
         data = await response.json(); 
        console.log(data);
        idPersona = data.id;
        console.log("PROBANDO idPersona", idPersona);
            // //crear el paciente
        try {
          const response = await fetch(`/paciente/crearPaciente`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                idPersona,
                obraSocial
            }),
          });
          if(response.ok){
            const data = await response.json(); 
            idPaciente=data.id;
            console.log("paciente creado",data);
            return idPaciente;
          }
        } catch (error) {
          console.log("no se pudo crear el paciente");
        }
      }
    } catch (error) {
      console.log("no se pudo crear persona");
    }
   return null;
   
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