document.addEventListener('DOMContentLoaded', function () {

    const calendarEl = document.getElementById('calendar');
    const selectEspecialidad = document.getElementById('especialidad');
    const selectMedico = document.getElementById('medico');
    const selectSucursal = document.getElementById('sucursal');
    const limpiarbtn = document.getElementById('limpiarbtn');
    const divs = document.getElementById('available-times');
    const sucursalesPorAgenda = {};
    const esPaciente = document.getElementById('esPacienteHidden')?.value === "1";
    function buildSucursalPorAgenda(agendas) {
        for (const a of agendas) {
            const idAgenda = a.idAgenda;
            if (!idAgenda) continue;

            sucursalesPorAgenda[idAgenda] = {
                idSucursal: a.idSucursal,
                nombre: a.sucursalNombre,
                direccion: a.sucursalDireccion
            };
        }

    }

    let calendar;

    let agendas = [];
    let agendasView = [];

    // ---- logica y helpers de selects ----
    function setPlaceholder(select, text) {
        select.innerHTML = '';
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = text;
        opt.disabled = true;
        opt.selected = true;
        select.appendChild(opt);
    }
    function fillSelect(select, items, { valueKey, labelKey }, placeholder) {
        setPlaceholder(select, placeholder);

        items.forEach(it => {
            const opt = document.createElement('option');
            opt.value = String(it[valueKey]);
            opt.textContent = it[labelKey];
            select.appendChild(opt);
        });

        select.disabled = false;
    }

    function uniqueBy(arr, key) {
        const map = new Map();
        for (const x of arr) map.set(x[key], x);
        return [...map.values()];
    }

    function buildFiltersFromAgendas(agendas) {
        const sucursales = uniqueBy(
            agendas.map(a => ({ idSucursal: a.idSucursal, sucursalLabel: `${a.sucursalNombre} - ${a.sucursalDireccion}` })),
            'idSucursal'
        ).sort((a, b) => a.sucursalLabel.localeCompare(b.sucursalLabel));

        const especialidades = uniqueBy(
            agendas.map(a => ({ idEspecialidad: a.idEspecialidad, especialidadNombre: a.especialidadNombre })),
            'idEspecialidad'
        ).sort((a, b) => a.especialidadNombre.localeCompare(b.especialidadNombre));

        const medicos = uniqueBy(
            agendas.map(a => ({ idMedico: a.idMedico, medicoNombre: a.medicoNombre })),
            'idMedico'
        ).sort((a, b) => a.medicoNombre.localeCompare(b.medicoNombre));

        fillSelect(selectSucursal, sucursales, { valueKey: 'idSucursal', labelKey: 'sucursalLabel' }, 'Seleccione una sucursal');
        fillSelect(selectEspecialidad, especialidades, { valueKey: 'idEspecialidad', labelKey: 'especialidadNombre' }, 'Seleccione una especialidad');
        fillSelect(selectMedico, medicos, { valueKey: 'idMedico', labelKey: 'medicoNombre' }, 'Seleccione un medico');
    }

    function applyFilters() {
        const sucursalId = selectSucursal.value;
        const especialidadId = selectEspecialidad.value;
        const medicoId = selectMedico.value;

        agendasView = agendas.filter(a => {
            if (sucursalId && String(a.idSucursal) !== sucursalId) return false;
            if (especialidadId && String(a.idEspecialidad) !== especialidadId) return false;
            if (medicoId && String(a.idMedico) !== medicoId) return false;
            return true;
        });

        renderAgendas(agendasView);
    }

    function refreshDependentOptionsBidireccional() {
        const sucursalId = selectSucursal.value;
        const especialidadId = selectEspecialidad.value;
        const medicoId = selectMedico.value;

        const all = agendas;

        const buildOptions = (arr, keyId, keyLabel) => {
            const map = new Map();
            for (const a of arr) {
                map.set(String(a[keyId]), { id: a[keyId], label: a[keyLabel] });
            }
            return [...map.values()].sort((x, y) => x.label.localeCompare(y.label));
        };

        let baseSuc = all;
        if (especialidadId) baseSuc = baseSuc.filter(a => String(a.idEspecialidad) === especialidadId);
        if (medicoId) baseSuc = baseSuc.filter(a => String(a.idMedico) === medicoId);

        const sucursales = uniqueBy(
            baseSuc.map(a => ({
                idSucursal: a.idSucursal,
                sucursalLabel: `${a.sucursalNombre} - ${a.sucursalDireccion}`
            })),
            'idSucursal'
        ).sort((a, b) => a.sucursalLabel.localeCompare(b.sucursalLabel));

        let baseEsp = all;
        if (sucursalId) baseEsp = baseEsp.filter(a => String(a.idSucursal) === sucursalId);
        if (medicoId) baseEsp = baseEsp.filter(a => String(a.idMedico) === medicoId);

        const especialidades = uniqueBy(
            baseEsp.map(a => ({ idEspecialidad: a.idEspecialidad, especialidadNombre: a.especialidadNombre })),
            'idEspecialidad'
        ).sort((a, b) => a.especialidadNombre.localeCompare(b.especialidadNombre));

        let baseMed = all;
        if (sucursalId) baseMed = baseMed.filter(a => String(a.idSucursal) === sucursalId);
        if (especialidadId) baseMed = baseMed.filter(a => String(a.idEspecialidad) === especialidadId);

        const medicos = uniqueBy(
            baseMed.map(a => ({ idMedico: a.idMedico, medicoNombre: a.medicoNombre })),
            'idMedico'
        ).sort((a, b) => a.medicoNombre.localeCompare(b.medicoNombre));

        const prevSuc = sucursalId;
        const prevEsp = especialidadId;
        const prevMed = medicoId;

        fillSelect(selectSucursal, sucursales, { valueKey: 'idSucursal', labelKey: 'sucursalLabel' }, 'Sucursales');
        fillSelect(selectEspecialidad, especialidades, { valueKey: 'idEspecialidad', labelKey: 'especialidadNombre' }, 'Especialidades');
        fillSelect(selectMedico, medicos, { valueKey: 'idMedico', labelKey: 'medicoNombre' }, 'Médicos');

        if (prevSuc && sucursales.some(x => String(x.idSucursal) === prevSuc)) selectSucursal.value = prevSuc;
        else selectSucursal.value = '';

        if (prevEsp && especialidades.some(x => String(x.idEspecialidad) === prevEsp)) selectEspecialidad.value = prevEsp;
        else selectEspecialidad.value = '';

        if (prevMed && medicos.some(x => String(x.idMedico) === prevMed)) selectMedico.value = prevMed;
        else selectMedico.value = '';
    }

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
                    info.el.style.backgroundColor = '#E0F7FA';


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

                    turnosLibres.forEach(data => {
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

                    if (horariosDisponibles.length === 0 && horariosOcupados.length === 0) {

                        info.el.style.pointerEvents = 'none';
                        info.el.style.opacity = '0.5';
                    } else {
                        if (horariosDisponibles.length > 0) {
                            info.el.style.position = 'relative';
                            const cantidadTurnos = document.createElement('div');
                            cantidadTurnos.className = 'turno-reservado';
                            cantidadTurnos.textContent = horariosDisponibles.length;
                            info.el.appendChild(cantidadTurnos);
                        }
                    }

                    // Configura el evento de click para las celdas habilitadas
                    info.el.addEventListener('click', function () {
                     
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
                            availableTimesEl.style.display = 'flex';
                            //ordenar los horarios libres y ocupados
                            const horariosCombinados = [
                                ...horariosDisponibles.map(t => ({ ...t, estado: "libre" })),
                                ...horariosOcupados.map(t => ({ ...t, estado: "ocupado" }))
                            ];
                            horariosCombinados.sort((a, b) =>
                                a.hora_inicio.localeCompare(b.hora_inicio)
                            );

                            const mins = horariosCombinados.map(t => timeToMinutes(t.hora_inicio));
                            const minTime = minutesToHHMM(Math.min(...mins));
                            const maxTime = minutesToHHMM(Math.max(...mins));

                            renderTurnosButtons(horariosCombinados, selectedDate, sobreturnosPorFecha, sobreturnoPorHorario, maxSobreturnoPorAgenda);
                            renderTimeFilter({
                                minTime,
                                maxTime,
                                onChange: (desde, hasta) => {
                                    const filtrados = filtrarPorRango(horariosCombinados, desde, hasta);

                                    const turnosParaMostrar = filtrados.filter(turno => {
                                        const idAgenda = turno.idAgenda;
                                        const maxSob = esPaciente ? 0 : (maxSobreturnoPorAgenda[idAgenda] || 0);

                                        const keyDia = `${idAgenda}|${selectedDate}`;
                                        const usados = sobreturnosPorFecha.get(keyDia) || 0;
                                        const hayCupo = usados < maxSob;

                                        const keyHora = `${idAgenda}|${selectedDate}|${turno.hora_inicio}`;
                                        const yaTieneSob = sobreturnoPorHorario.has(keyHora);

                                        if (turno.estado === 'ocupado' && (!hayCupo || yaTieneSob)) return false;

                                        turno._esSobre = (turno.estado === 'ocupado');
                                        return true;
                                    });

                                    divs.style.display = 'none';
                                    renderHorasConDataTable(turnosParaMostrar, selectedDate);
                                },

                                onClear: () => { }
                            });

                            document.getElementById('date-title').innerHTML = '<div class="turnos-vacio">Ingresá un rango</div>';



                        } else {
                            alert(`No hay turnos disponibles para el día ${selectedDate}`);
                        }
                    });
                } else {
                    info.el.style.pointerEvents = 'none';
                    info.el.style.opacity = '0.5';
                }
            }


        });
        calendar.render();
    }

    function renderAgendas(lista) {
        console.log('Agendas filtradas:', lista);

    }

    (async function init() {

        selectSucursal.disabled = true;
        selectEspecialidad.disabled = true;
        selectMedico.disabled = true;
        setPlaceholder(selectSucursal, 'Cargando...');
        setPlaceholder(selectEspecialidad, 'Cargando...');
        setPlaceholder(selectMedico, 'Cargando...');

        agendas = await fetchAgendasActivas();
        agendasView = agendas;
        buildSucursalPorAgenda(agendas);
        console.log("Sucursales:", sucursalesPorAgenda);
        buildFiltersFromAgendas(agendas);
        renderAgendas(agendasView);
    })();

    selectSucursal.addEventListener('change', onFiltersChanged);
    selectEspecialidad.addEventListener('change', onFiltersChanged);
    selectMedico.addEventListener('change', onFiltersChanged);


    limpiarbtn.addEventListener('click', (e) => {
        e.preventDefault();
        resetUIAgenda();
        selectSucursal.value = '';
        selectEspecialidad.value = '';
        selectMedico.value = '';
        buildFiltersFromAgendas(agendas);
        renderAgendas(agendas);
    });
    function onFiltersChanged() {
        resetUIAgenda();
        refreshDependentOptionsBidireccional();
        applyFilters();

        if (!selectMedico.value || !selectEspecialidad.value) {
            return;
        }

        cargarHorariosPorMedicoEspecialidad();
    }


    //logica del calendario
    function getAgendasSeleccionadas() {
        const medicoId = selectMedico.value;
        const especialidadId = selectEspecialidad.value;
        const sucursalId = selectSucursal.value;

        return agendas.filter(a =>
            String(a.idMedico) === medicoId &&
            String(a.idEspecialidad) === especialidadId && (!sucursalId || String(a.idSucursal) === sucursalId)
        );
    }
    async function cargarHorariosPorMedicoEspecialidad() {
        const agendasSel = getAgendasSeleccionadas();
        if (agendasSel.length === 0) {
            console.log('No hay agendas disponibles para ese médico/especialidad');
            return;
        }

        const horariosData = await fetchHorariosPorAgenda(agendasSel);

        const horarios = horariosData.flatMap(a => a.horarios || []);
        console.log('Horarios:', horarios);

        const dias = obtenerDiasSemana(horarios);

        if (horarios.length > 0) {

            console.log("DIAS SEMANA: ", dias);
            const agendaIds = [...new Set(
                horariosData
                    .map(h => h.idAgenda ?? h.IDAgenda ?? h.ID)
                    .filter(Boolean)
            )];

            const maxSobreturnoPorAgenda = {};

            horariosData.forEach(agenda => {
                const idA = agenda.idAgenda;
                (agenda.horarios || []).forEach(h => {
                    const max = Number(h.sobreturnoMax ?? 0);
                    maxSobreturnoPorAgenda[idA] = Math.max(maxSobreturnoPorAgenda[idA] ?? 0, max);
                });
            });
            console.log("AGENDA ID", agendaIds);
            turnosDisponibles = await obtenerTurnosLibres(agendaIds);
            turnosReservados = await obtenerTurnosConSobreturno(agendaIds); //estos son turnos reservados de tipo normales
            sobreturnos = await obtenerSobreturnos(agendaIds);


            console.log("TURNOS DISPONIBLES: ", turnosDisponibles);
            console.log("TURNOS RESERVADOS: ", turnosReservados);
            console.log("SOBRETURNOS: ", sobreturnos);
            console.log("MAX SOBRETURNOS POR AGENDA: ", maxSobreturnoPorAgenda);
            const sobPorFecha = new Map();
            const sobPorHorario = new Set();

            for (const s of sobreturnos) {
                const fecha = new Date(s.fecha).toISOString().split('T')[0];
                const kDia = `${s.idAgenda}|${fecha}`;
                sobPorFecha.set(kDia, (sobPorFecha.get(kDia) || 0) + 1);

                const kHora = `${s.idAgenda}|${fecha}|${s.hora_inicio}`;
                sobPorHorario.add(kHora);
            }

            const hoyStr = new Date().toISOString().split('T')[0];

            function esFuturoOHoy(fechaBD) {
                const f = new Date(fechaBD).toISOString().split('T')[0];
                return f >= hoyStr;
            }
            const haySobreturnoDisponibleFuturo = turnosReservados.some(t => {
                if (!esFuturoOHoy(t.fecha)) return false;
                const fecha = new Date(t.fecha).toISOString().split('T')[0];

                const maxSob = maxSobreturnoPorAgenda[t.idAgenda] || 0;

                const kDia = `${t.idAgenda}|${fecha}`;
                const usados = sobPorFecha.get(kDia) || 0;
                const hayCupo = usados < maxSob;

                const kHora = `${t.idAgenda}|${fecha}|${t.hora_inicio}`;
                const yaTieneSob = sobPorHorario.has(kHora);

                return hayCupo && !yaTieneSob;
            });
            console.log("Hay sobreturno disponible: ", haySobreturnoDisponibleFuturo);
            const turnosLibresFuturos = turnosDisponibles.filter(t => esFuturoOHoy(t.fecha));


            const hayAlgoParaMostrar = (turnosLibresFuturos.length > 0) || haySobreturnoDisponibleFuturo;
           
            if (hayAlgoParaMostrar) {
                document.getElementById('date-title').style.display = 'flex';

                if (calendar) {
                    calendar.destroy();
                    document.getElementById('agenda').style.display = 'none';
                }

                const agenda = document.getElementById('agenda-medico');
                const agendaE = document.getElementById('agenda-especialidad');
                document.getElementById('agenda').style.display = 'flex';
                const medicoNombre = selectMedico.selectedOptions[0]?.text;
                const especialidadSeleccion = selectEspecialidad.selectedOptions[0]?.text;

                agenda.style.display = 'flex';
                agenda.innerHTML = `Agenda de  &nbsp;<strong> ${medicoNombre} </strong>`;
                agendaE.style.display = 'flex';
                agendaE.innerHTML = ` Especialidad: &nbsp;<strong> ${especialidadSeleccion} </strong>`;

                crearCalendario(dias, turnosLibresFuturos, turnosReservados, sobreturnos, maxSobreturnoPorAgenda);
            } else {
                alert("Sin turnos disponibles");
                if (divs) divs.innerHTML = '';
                document.getElementById('agenda').style.display = 'none';
                document.getElementById('time-filter').style.display = 'none';
                document.getElementById('tablaHoras').style.display = 'none';

                const title = document.getElementById('date-title');
                title.style.display = 'flex';
                title.innerHTML = '<div class="turnos-vacio">Sin turnos disponibles</div>';

                if (calendar) calendar.destroy();
            }
        } else {
            alert("Sin turnos disponibles");
            if (divs) divs.innerHTML = '';
            document.getElementById('agenda').style.display = 'none';
            document.getElementById('date-title').style.display = 'none';
            if (calendar) calendar.destroy();
        }


    }

    selectMedico.addEventListener('change', cargarHorariosPorMedicoEspecialidad);
    selectEspecialidad.addEventListener('change', cargarHorariosPorMedicoEspecialidad);

    function obtenerDiasSemana(horarios) {
        const set = new Set();
        const diasemanas = {
            LUNES: 1,
            MARTES: 2,
            MIERCOLES: 3,
            JUEVES: 4,
            VIERNES: 5,
            SABADO: 6
        };
        horarios.forEach(h => {
            if (!h.dia_semana) return;
            const dia = String(h.dia_semana).trim().toUpperCase();
            const n = diasemanas[dia];
            set.add(n);
        });
        return [...set].sort((a, b) => a - b);
    }


    function timeToMinutes(hhmmss) {
        const [hh, mm] = String(hhmmss).split(':');
        return Number(hh) * 60 + Number(mm);
    }

    function minutesToHHMM(min) {
        const hh = String(Math.floor(min / 60)).padStart(2, '0');
        const mm = String(min % 60).padStart(2, '0');
        return `${hh}:${mm}`;
    }
    function renderTimeFilter({ minTime, maxTime, onChange, onClear }) {
        const filterEl = document.getElementById('time-filter');
        filterEl.style.display = 'block';

        filterEl.innerHTML = `
    <div class="time-filter-row">
      <label>Desde</label>
      <input type="time" id="f-desde" value="${minTime}" step="600">
      <label>Hasta</label>
      <input type="time" id="f-hasta" value="${maxTime}" step="600">
      <button type="button" id="f-limpiar">Limpiar</button>
    </div>
  `;

        const desdeEl = document.getElementById('f-desde');
        const hastaEl = document.getElementById('f-hasta');

        const fire = () => onChange(desdeEl.value, hastaEl.value);

        desdeEl.addEventListener('input', fire);
        hastaEl.addEventListener('input', fire);
        desdeEl.addEventListener('change', fire);
        hastaEl.addEventListener('change', fire);

        document.getElementById('f-limpiar').onclick = () => {
            desdeEl.value = minTime;
            hastaEl.value = maxTime;
            onClear();
            fire();
        };

        fire();
    }

    function filtrarPorRango(turnos, desde, hasta) {
        const d = timeToMinutes(desde);
        const h = timeToMinutes(hasta);

        const min = Math.min(d, h);
        const max = Math.max(d, h);

        return turnos.filter(t => {
            const m = timeToMinutes(t.hora_inicio);
            return m >= min && m <= max;
        });
    }
    let dtHoras = null;

    function chunkToGrid(turnos, cols = 3) {
        const rows = [];
        for (let i = 0; i < turnos.length; i += cols) {
            const row = [];
            for (let j = 0; j < cols; j++) {
                const t = turnos[i + j];
                if (!t) {
                    row.push('');
                    continue;
                }

                const clase = t.estado === 'libre' ? 'libre' : 'ocupado';

                row.push(`
        <div class="btn-hora ${clase}"
             data-id="${t.id}"
             data-idagenda="${t.idAgenda}"
             data-hora="${t.hora_inicio}"
             data-estado="${t.estado}"
             data-fecha="${t._fechaSeleccionada}"
             data-essobre="${t._esSobre ? 1 : 0}">
          ${t.hora_inicio}
        </div>
      `);
            }
            rows.push(row);
        }
        return rows;
    }

    function renderHorasConDataTable(turnosFiltrados, selectedDate) {
        const tableEl = document.getElementById('tablaHoras');
        tableEl.style.display = 'table';


        const turnos = turnosFiltrados.map(t => ({ ...t, _fechaSeleccionada: selectedDate }));

        const gridRows = chunkToGrid(turnos, 3);

        if (dtHoras) {
            dtHoras.clear().rows.add(gridRows).draw();
            return;
        }

        dtHoras = $('#tablaHoras').DataTable({
            data: gridRows,
            columns: [{ title: '' }, { title: '' }, { title: '' }],
            pageLength: 4,
            lengthChange: false,
            ordering: false,
            bDestroy:true,
            searching: false,
            info: false,
            paging: true,
            language: {
                processing: "Procesando...",
                search: "Buscar:",
                lengthMenu: "Mostrar _MENU_ registros",
                info: "Mostrando _START_ a _END_ de _TOTAL_ horarios",
                infoEmpty: "No hay horarios disponibles",
                infoFiltered: "(filtrado de _MAX_ totales)",
                infoPostFix: "",
                loadingRecords: "Cargando...",
                zeroRecords: "No hay horarios en este rango",
                emptyTable: "No hay horarios disponibles para esta fecha",
                paginate: {
                    first: "Primero",
                    previous: "Anterior",
                    next: "Siguiente",
                    last: "Último"
                },
                aria: {
                    sortAscending: ": Activar para ordenar la columna de manera ascendente",
                    sortDescending: ": Activar para ordenar la columna de manera descendente"
                }
            }
        });

        $('#tablaHoras tbody').on('click', '.btn-hora', function () {
            const id = Number(this.dataset.id);
            const idAgenda = Number(this.dataset.idagenda);
            const hora_inicio = this.dataset.hora;
            const estado = this.dataset.estado;
            const fecha = this.dataset.fecha;
            const esSobre = this.dataset.essobre === '1';

            const turno = { id, ID: id, idAgenda, hora_inicio, estado };
            console.log('turno', turno);
            cargarDatosModal(turno, fecha, esSobre);
            abrirModal(id, esSobre);
        });
    }

    function renderTurnosButtons(turnos, selectedDate, sobreturnosPorFecha, sobreturnoPorHorario, maxSobreturnoPorAgenda, limit = 15) {
        const availableTimesEl = document.getElementById('available-times');
        availableTimesEl.innerHTML = '';

        let count = 0;

        for (const turno of turnos) {
            if (count >= limit) break;

            const idAgenda = turno.idAgenda;
            const maxSobreturnos = esPaciente ? 0 : (maxSobreturnoPorAgenda[idAgenda] || 0);

            const keyDia = `${idAgenda}|${selectedDate}`;
            const usados = sobreturnosPorFecha.get(keyDia) || 0;
            const hayCupo = usados < maxSobreturnos;

            const keyHora = `${idAgenda}|${selectedDate}|${turno.hora_inicio}`;
            const yaTieneSobreturno = sobreturnoPorHorario.has(keyHora);

            if (turno.estado === "ocupado" && (!hayCupo || yaTieneSobreturno)) {
                continue;
            }

            const timeBtn = document.createElement("div");
            timeBtn.textContent = turno.hora_inicio;
            timeBtn.id = turno.id;

            if (turno.estado === "libre") {
                timeBtn.className = "hora-disponible";
                timeBtn.addEventListener("click", () => {
                    cargarDatosModal(turno, selectedDate, false);
                    abrirModal(turno.id, false);
                });
            } else {
                timeBtn.className = "hora-reservada";
                timeBtn.addEventListener("click", () => {
                    cargarDatosModal(turno, selectedDate, true);
                    abrirModal(turno.id, true);
                });
            }

            availableTimesEl.appendChild(timeBtn);
            count++;
        }

        if (turnos.length > limit) {
            const more = document.createElement('div');
            more.className = 'turnos-more';
            availableTimesEl.appendChild(more);
        }

        if (count === 0) {
            availableTimesEl.innerHTML = '<div class="turnos-vacio">No hay turnos en ese rango.</div>';
        }
    }

    let confirmado = false;

    const modal = document.getElementById('turnoModal');
    const btnConfirmar = document.getElementById('confirmar');
    const btnCerrar = document.getElementById('cerrarModal');


    async function abrirModal(id_turno, esSobreturno) {
        const inputOculto = document.getElementById('idPacienteHidden');
        let idPaciente = inputOculto ? inputOculto.value : null;

        if (!idPaciente) {
             const url = window.location.href;
             const match = url.match(/\/(\d+)\/agendarTurno/);
             idPaciente = match ? match[1] : null;
        }

        if (!idPaciente) {
            alert("Error: No se pudo identificar al paciente.");
            return;
        }

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

            await refrescarCalendario();
            cerrarModal();
            document.getElementById('time-filter').style.display = 'none';
            document.getElementById('available-times').innerHTML = '';
            document.getElementById('available-times').style.display = 'none';
            document.getElementById('tablaHoras').style.display = 'none';
        }

        btnCerrar.onclick = () => {
            cerrarModal();
        }

    }
    function resetUIAgenda() {
        if (calendar) {
            calendar.destroy();
            calendar = null;
        }


        const agendaBox = document.getElementById('agenda');
        if (agendaBox) agendaBox.style.display = 'none';

        const timeFilter = document.getElementById('time-filter');
        if (timeFilter) {
            timeFilter.innerHTML = '';
            timeFilter.style.display = 'none';
        }

        const available = document.getElementById('available-times');
        if (available) {
            available.innerHTML = '';
            available.style.display = 'none';
        }
        const wrapper = document.getElementById('tablaHoras_wrapper');
        if (wrapper) wrapper.style.display = 'none';

        if (dtHoras) {
            dtHoras.clear().draw();
            dtHoras = null;
        }
        const title = document.getElementById('date-title');
        if (title) {
            title.style.display = 'flex';
            title.innerHTML = '<div class="turnos-vacio">Seleccione una fecha</div>';
        }

    }

    async function refrescarCalendario() {
        const agendasSeleccionadas = getAgendasSeleccionadas();
        if (agendasSeleccionadas.length === 0) return;

        const agendaIds = agendasSeleccionadas.map(a => a.idAgenda);

        const horariosData = await fetchHorariosPorAgenda(agendasSeleccionadas);
        const horarios = horariosData.flatMap(a => a.horarios || []);

        const dias = obtenerDiasSemana(horarios);

        const maxSobreturnoPorAgenda = {};
        horariosData.forEach(a => {
            (a.horarios || []).forEach(h => {
                maxSobreturnoPorAgenda[a.idAgenda] =
                    Math.max(maxSobreturnoPorAgenda[a.idAgenda] || 0, h.sobreturnoMax || 0);
            });
        });

        const turnosDisponibles = await obtenerTurnosLibres(agendaIds);
        const turnosReservados = await obtenerTurnosConSobreturno(agendaIds);
        const sobreturnos = await obtenerSobreturnos(agendaIds);

        if (calendar) calendar.destroy();

        crearCalendario(
            dias,
            turnosDisponibles,
            turnosReservados,
            sobreturnos,
            maxSobreturnoPorAgenda
        );
    }


    function cerrarModal() {
        document.getElementById('turnoModal').style.display = 'none';
        confirmado = false;
        btnConfirmar.disabled = false;
        btnConfirmar.textContent = 'Confirmar';

    }
    const doctorInput = document.getElementById('doctor');
    const sucursalInput = document.getElementById('sucursalModel');
    const especialidadInput = document.getElementById('especialidadDoctor');
    const horarioInput = document.getElementById('horario');
    const fechaInput = document.getElementById('fecha');
    const motivoConsultaInput = document.getElementById('motivoConsulta');
    const tituloModal = document.getElementById("modal-header");

    function cargarDatosModal(turno, selectedDate, esSobreturno) {

        const medicoOpt = selectMedico.selectedOptions[0];
        const espOpt = selectEspecialidad.selectedOptions[0];

        doctorInput.textContent = medicoOpt?.textContent || '';
        especialidadInput.textContent = espOpt?.textContent || '';
        horarioInput.textContent = turno.hora_inicio;
        fechaInput.textContent = selectedDate;
        console.log("TURNO ID AGENDA", turno.idAgenda);
        const suc = sucursalesPorAgenda[turno.idAgenda];
        console.log("SUCURSAL de la agenda", suc.nombre);
        sucursalInput.textContent = suc ? `${suc.nombre} - ${suc.direccion}` : '';

        if (motivoConsultaInput) motivoConsultaInput.value = '';

        if (tituloModal) {
            tituloModal.textContent = esSobreturno
                ? 'Confirmación de sobreturno'
                : 'Confirmación de turno';
        }
    }


    //----fetchs-
    async function fetchAgendasActivas() {
        const res = await fetch('/agenda/activas');
        if (!res.ok) throw new Error('No se pudieron obtener las agendas activas');
        return await res.json();
    }

    async function fetchHorariosPorAgenda(agendas) {
        if (!Array.isArray(agendas) || agendas.length === 0) {
            return [];
        }
        const result = await Promise.all(
            agendas.map(async (agenda) => {
                const res = await fetch(`/horario/obtenerHorariosPorAgenda/${agenda.idAgenda}`);

                if (!res.ok) throw new Error('No se pudieron obtener horarios');

                const horarios = await res.json();
                return {
                    ...agenda,
                    horarios
                };
            })
        );

        return result;
    }

    async function obtenerTurnosLibres(agendas) {
        if (!Array.isArray(agendas) || agendas.length === 0) return [];

        const requests = agendas.map(async (agendaId) => {
            const idAgenda = Number(agendaId);
            if (!idAgenda) return [];

            const res = await fetch(`/turno/turnosLibres/${idAgenda}`);
            if (!res.ok) {
                console.error(`Error al obtener turnos libres para agenda ${idAgenda}`, res.status);
                return [];
            }

            const data = await res.json();
            return Array.isArray(data) ? data : [];
        });

        const result = await Promise.all(requests);


        return result.flat();
    }
    async function obtenerTurnosConSobreturno(dataAgenda) {
        const sobreturnos = [];

        for (const agenda of dataAgenda) {
            const response = await fetch(`/turno/turnosSinSobreturno/${agenda}`);

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
            const response = await fetch(`/turno/obtenerSobreturnos/${agenda}`);

            if (response.ok) {
                const data = await response.json();
                if (data.length > 0) sobreturnos.push(...data);
            }
        }

        return sobreturnos;
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




})