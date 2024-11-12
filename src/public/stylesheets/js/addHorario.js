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
    const pathParts = window.location.pathname.split('/'); // Divide la URL por '/'
    const idMedico = pathParts[pathParts.length - 1];
    // const select = new MultiSelectTag('semana',{
    //     onchange: function(){
    //         obtenerSelectSemana();
    //     }
    // });

    //semana es de seleccion multiple
//    const selectSemana = document.getElementById('semana');

    const selectEspecialidad = document.getElementById('especialidad');
    const sobreTurnoMax=2;


    const obtenerEspecialidadSeleccionada = () => {
        const especialidad = selectEspecialidad;
        console.log('"id medico_especialidad":', especialidad.value);
        return especialidad;
    };
    const obtenerSucursalSeleccionada = () => {
        const idSucursale = selectSucursal.value;
        return idSucursale;
    };
    const obtenerSelectSemana = () => {
    //    const semana = selectSemana.value;
    // //    const semana= select;
    //     console.log('semana seleccionada:', semana);
    //     return semana;
        const checkboxes = document.querySelectorAll('input[name="dia"]:checked');
        const diasSeleccionados = Array.from(checkboxes).map(checkbox => checkbox.value);
        console.log(diasSeleccionados);
        return diasSeleccionados;
    }




    ///////////////////////////////////
    selectSucursal.addEventListener('change', obtenerSucursalSeleccionada);
    // selectSemana.addEventListener('change', obtenerSelectSemana);
    //select.addEventListener('change', obtenerSelectSemana);
    selectEspecialidad.addEventListener('change', obtenerEspecialidadSeleccionada);

    btnAgregarHorario.addEventListener('click', async function (event){
        const semana = obtenerSelectSemana();
        const idSucursal = obtenerSucursalSeleccionada();
        const especialidad = obtenerEspecialidadSeleccionada();
        const idMedico_especialidad= especialidad.value;
        const duracionTurno = document.getElementById('duracionTurno').value;
        const fecha_init = document.getElementById('fecha_inicio').value;
        //Crear una agenda para cada día de semana 
        semana.forEach( async (dia) => {
            
            //validaciones
            const hoy = new Date();
            const dosMesesDespues = new Date();
            dosMesesDespues.setMonth(hoy.getMonth() + 2);
            const formatoFecha = (fecha) => {
                const dia = String(fecha.getDate()).padStart(2, '0');
                const mes = String(fecha.getMonth() + 1).padStart(2, '0'); 
                const anio = fecha.getFullYear();
                return `${anio}-${mes}-${dia}`;
              };
              fecha_init.min = formatoFecha(hoy);
              fecha_init.max = formatoFecha(dosMesesDespues);
            if (!fecha_init.value) {
                alert('Se debe seleccionar una fecha.');
                event.preventDefault(); 
            }else{
                if (!numeroInput.value) {
                    alert('Por favor, ingresa un número.');
                    event.preventDefault();
                    return;
                  }else{
                        const numero = parseInt(numeroInput.value, 10);
                        if (numero < 10 || numero > 60 || numero % 10 !== 0) {
                        alert('Duracion de turno debe ser de 10, 20, 30, 40, 50 o 60 minutos.');
                        event.preventDefault();
                        }else{
                            if (idSucursal === undefined) {
                                alert('Por favor, selecciona una sucursal.');
                                event.preventDefault();
                            }else{
                                if(idMedico_especialidad === undefined){
                                    alert('Por favor, selecciona una especialidad.');
                                }
                            }
                        }
                    }
            }
            checkboxes.forEach((checkbox) => {
                if (checkbox.checked) {
                  seleccionado = true;
                }
              });
            
              if (!seleccionado) {
                alert("Seleccioná al menos un día de la semana.");
              } else {
                try {
                    const response = await fetch('/agenda/crearAgenda', {
                       method: 'POST',
                       headers: {
                           'Content-Type': 'application/json',
                       },
                       body: JSON.stringify({
                           idMedico_especialidad,
                           idSucursal,
                           diaSemana,
                           sobreTurnoMax,
                           duracionTurno
                       }),
                       
                   });
                   if (response.ok) {
                       const data = await response.json(); 
                       const idAgenda = data.id;
                       console.log("este es idAgenda:",idAgenda);
                    //    obtener el horario del form
                           const hora_inicio = document.getElementById('hora_inicio').value;
                           const hora_fin = document.getElementById('hora_fin').value;
                           const fecha_inicio = document.getElementById('fecha_inicio').value;
                           const fecha_fin = document.getElementById('fecha_fin').value;
                           const estado = "libre";
                           const horafinFormat=`${hora_fin}:00`;
                           const horainitFormat=`${hora_inicio}:00`;
                           console.log("hora_inicio:",hora_inicio);
                           console.log("hora_fin:",hora_fin);
                           console.log("fecha_inicio:",fecha_inicio);
    
                           try {
                               const response = await fetch('/horario/crearHorario', {
                                   method: 'POST',
                                   headers: {
                                       'Content-Type': 'application/json',
                                   },
                                   body: JSON.stringify({  fecha_inicio,
                                       fecha_fin,
                                       horafinFormat,
                                       horainitFormat,
                                       estado,
                                       idAgenda
                                   }),
                               });
                                   if (response.ok) {
                                    
                                       formHorario.reset(); 
                                           alert('Horario registrado exitosamente'); 
                                //al crear la agenda se tiene que crear los turnos 
                                    const response = await fetch("/turno/generarTurnos", {
                                        method: 'POST', 
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({  
                                            idAgenda,
                                            horafinFormat,
                                            horainitFormat,
                                            fecha_inicio,
                                            fecha_fin,
                                            diaSemana,
                                            duracionTurno
                                    })
                                    });
                                    if (!response.ok) {
                                        throw new Error(`Error en la solicitud: ${response.statusText}`);
                                    }
                            
                                    const result = await response.json();  // Si el servidor devuelve JSON
                                    console.log('Resultado del servidor:', result);
    
                                   }else{
                                       alert('Error al registrar el horario');
                                   }
                       
                                   const data = await response.json();
                                   console.log(data); 
                               } catch (error) {
                                   console.error('Error al enviar el formulario:', error);
                               }
                   }
               } catch (error) {
                   console.error('Error al enviar el formulario:', error);
               }
              }
           
        });
        

    })
    //cargar select de especialidades
    const cargarSelectEspecialidades = async (idMedico) => {
        const especialidades = await obtenerEspecialidades(idMedico);
        console.log("especialidades:",especialidades);
        selectEspecialidad.innerHTML = ''; 
        const option = document.createElement('option');
        option.textContent = '-- Seleccione una especialidad --';
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
        option.value = -1;
        option.textContent = '-- Seleccione una sucursal --';
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