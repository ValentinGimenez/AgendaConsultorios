document.addEventListener('DOMContentLoaded', async () => {
    const btnAgregarMedico = document.getElementById('AgregarMedico');
    const formMedicoNew = document.getElementById('formMedicoNew');
    btnAgregarMedico.addEventListener('click', async ()=>{
        const nombre = document.getElementById('nombre').value.trim().toUpperCase();
        const apellido = document.getElementById('apellido').value.trim().toUpperCase();
        const dni = document.getElementById('dni').value.trim();
        const mail = document.getElementById('mail').value.trim();
        const telefono = document.getElementById('telefono').value.trim();
        try {
            const response = await fetch('persona/crearPersona', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nombre,
                    apellido,
                    dni,
                    mail,
                    telefono,
                }),
            });

            if (response.ok) {
                    formMedicoNew.reset(); 
                    alert('Médico registrado exitosamente'); 
            }else{
                alert('Error al registrar el médico');
            }

            const data = await response.json();
            console.log(data); 

        } catch (error) {
            console.error('Error al enviar el formulario:', error);
        }
    })
});

