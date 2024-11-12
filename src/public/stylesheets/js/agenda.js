script.
      document.addEventListener('DOMContentLoaded', function() {
        const calendarEl = document.getElementById('calendar');
        const dateTitle = document.getElementById('date-title');
        const availableTimesEl = document.getElementById('available-times');

        // Inicialización del calendario con FullCalendar
        const calendar = new FullCalendar.Calendar(calendarEl, {
          initialView: 'dayGridMonth',
          headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: ''
          },
          dayCellDidMount: function(info) {
            // Agrega un evento de clic a cada celda de día
            info.el.addEventListener('click', function() {
              const selectedDate = info.dateStr;
              dateTitle.textContent = `Horas disponibles para el ${selectedDate}`;

              // Simulación de datos de horas disponibles
              const horasDisponibles = ["15:00", "16:30", "17:00", "17:30", "18:00", "19:00", "19:30"];

              // Limpia el contenedor de horas y agrega las nuevas horas
              availableTimesEl.innerHTML = '';
              horasDisponibles.forEach(hora => {
                const timeBtn = document.createElement('div');
                timeBtn.className = 'hora-disponible';
                timeBtn.textContent = hora;

                // Evento para confirmar la selección de la hora
                timeBtn.addEventListener('click', function() {
                  alert(`Has seleccionado la hora: ${hora} para el día ${selectedDate}`);
                });

                availableTimesEl.appendChild(timeBtn);
              });
            });
          }
        });

        // Renderizar el calendario
        calendar.render();
      });
