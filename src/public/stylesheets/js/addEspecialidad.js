document.addEventListener('DOMContentLoaded', async () => {
    const btnAgregarEspecialidad = document.getElementById('agregarEspecialidad');
    const formEspecialidad = document.getElementById('formEspecialidad');
    cargarDatosSelect();



    btnAgregarEspecialidad.addEventListener('click', async () => {
        const especialidad = document.getElementById('especialidad').value.trim();
        const matricula = document.getElementById('matricula').value.trim();
        const idMedico = req.params.id;

        if (!especialidad || !matricula) {
            alert('Todos los campos son obligatorios');
            return;
        }

        if (!/^\d{5}$/.test(matricula)) {
            alert('La matricula debe contener 5 dígitos');
            return;
        }

        const response = await fetch('/medico_especialidad/crearRelacion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ idMedico, idEspecialidad, matricula })
        });

        if (response.ok) {
            formEspecialidad.reset();
            alert('Horario registrado exitosamente');
        } else {
            alert('Error al registrar el horario');
        }

        const data = await response.json();
        console.log(data);
    });
});


const cargarDatosSelect = async () => {
    const especialidadesDisponibles = await obtenerEspecialidades();
    const selectEspecialidad = document.getElementById('especialidad');
    // Limpiar el select    
    selectEspecialidad.innerHTML = '';
    const option = document.createElement('option');
    option.value = -1;
    option.textContent = '-- Seleccione una especialidad --';
    selectEspecialidad.appendChild(option);
    if (especialidadesDisponibles && especialidadesDisponibles.length > 0) {
        especialidadesDisponibles.forEach(especialidad => {
            const option = document.createElement('option');
            option.value = especialidad.id;
            option.textContent = especialidad.nombre;
            selectEspecialidad.appendChild(option);
        });
    } else {
        // Mensaje en caso de no haber especialidades disponibles
        const optionNoData = document.createElement('option');
        optionNoData.value = -1;
        optionNoData.textContent = 'No hay especialidades disponibles';
        selectEspecialidad.appendChild(optionNoData);
    }

};

const obtenerEspecialidades = async () => {

   // try {
        const especialidades = await fetch("/especialidad/listarEspecialidades");
        console.log("especialidades:",especialidades.json());
        if (!especialidades.ok) {
            const errorText = await response.text();

            throw new Error('Error al obtener las especialidades:',errorText);
        }
        const especialidadesJSON = await especialidades.json();
        console.log("especialidadesJSON:", especialidadesJSON);
        return especialidadesJSON;

   /* } catch (error) {
        console.error('Error al obtener las especialidades:', error);
        return null;
    }*/

};