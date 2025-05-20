// DiasLaborales.js
document.addEventListener('DOMContentLoaded', () => {
  const MONTH_NAMES = [
    'Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
  ];

  // Modales & elementos
  const offModal         = new bootstrap.Modal('#offdaysModal');
  const assignModal      = new bootstrap.Modal('#assignModal');
  const alertPlaceholder = document.getElementById('alertPlaceholder');

  const prevBtn    = document.querySelector('.btn-prev');
  const nextBtn    = document.querySelector('.btn-next');
  const monthLabel = document.querySelector('.current-month');
  const grid       = document.querySelector('.calendar-grid');
  const offGrid    = document.querySelector('.offcalendar');
  const btnSetOff  = document.getElementById('btnSetOff');
  const btnSaveOff = document.getElementById('btnSaveOff');
  const btnAssign      = document.getElementById('btnAssignBranch');
  const btnSaveAssign  = document.getElementById('btnSaveAssign');

  const selBranch      = document.getElementById('branch-select');
  const selMonthCount  = document.getElementById('assign-months');
  const selAssignYear  = document.getElementById('assign-year');
  const monthsGrid     = document.querySelector('.months-grid');

  // Datos
  let today       = new Date();
  let curMonth    = today.getMonth();
  let curYear     = today.getFullYear();
  let offDays     = JSON.parse(localStorage.getItem('psico_offdays') || '[]');
  let assignments = JSON.parse(localStorage.getItem('psico_assignments') || '[]');

  // Mostrar alerta
  function showAlert(msg, type='success') {
    alertPlaceholder.innerHTML = `
      <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${msg}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>`;
  }

  // Render calendario (7 cols). useOff=true en modal Off
  function renderCalendar(month, year, container, useOff=false) {
    container.innerHTML = '';
    // Cabeceras L-M-X-J-V-S-D
    ['L','M','X','J','V','S','D'].forEach(letter => {
      const h = document.createElement('div');
      h.className = 'col fw-bold';
      h.textContent = letter;
      container.appendChild(h);
    });

    const firstDay = new Date(year, month, 1).getDay(); // 0=Domingo
    const offset   = (firstDay + 6) % 7;                // Lunes=0
    const daysInMonth = new Date(year, month+1, 0).getDate();

    // Celdas vacías
    for (let i=0; i<offset; i++) {
      const e = document.createElement('div');
      e.className = 'col empty';
      container.appendChild(e);
    }

    // Días del mes
    for (let d=1; d<=daysInMonth; d++) {
      const cell = document.createElement('div');
      cell.className = 'col day-cell';
      cell.textContent = d;
      const key = `${year}-${month+1}-${d}`;

      if (useOff) {
        if (offDays.includes(key)) cell.classList.add('selected');
        cell.addEventListener('click', () => {
          const idx = offDays.indexOf(key);
          if (idx>=0) offDays.splice(idx,1);
          else offDays.push(key);
          cell.classList.toggle('selected');
        });
      } else {
        if (offDays.includes(key)) cell.classList.add('offday');
      }

      container.appendChild(cell);
    }
  }

  // Navegar meses
  prevBtn.addEventListener('click', () => {
    curMonth--; if (curMonth<0){ curMonth=11; curYear--; }
    monthLabel.textContent = `${MONTH_NAMES[curMonth]} ${curYear}`;
    renderCalendar(curMonth,curYear,grid);
  });
  nextBtn.addEventListener('click', () => {
    curMonth++; if (curMonth>11){ curMonth=0; curYear++; }
    monthLabel.textContent = `${MONTH_NAMES[curMonth]} ${curYear}`;
    renderCalendar(curMonth,curYear,grid);
  });

  // Modal Días no laborables
  btnSetOff.addEventListener('click', () => {
    offDays = JSON.parse(localStorage.getItem('psico_offdays') || '[]');
    renderCalendar(curMonth,curYear,offGrid, true);
    offModal.show();
  });
  btnSaveOff.addEventListener('click', () => {
    localStorage.setItem('psico_offdays', JSON.stringify(offDays));
    offModal.hide();
    renderCalendar(curMonth,curYear,grid);
    showAlert('Días no laborables guardados.');
  });

  // Rellenar formulario Asignar sucursal
  function populateAssignForm() {
    selAssignYear.innerHTML = '';
    for (let y=curYear-3; y<=curYear+3; y++) {
      const o = document.createElement('option');
      o.value = y; o.textContent = y;
      if (y===curYear) o.selected = true;
      selAssignYear.append(o);
    }
    monthsGrid.innerHTML = '';
    MONTH_NAMES.forEach((m,i) => {
      const d = document.createElement('div');
      d.className = 'form-check';
      d.innerHTML = `
        <input class="form-check-input" type="checkbox" id="mon${i+1}" value="${i+1}">
        <label class="form-check-label" for="mon${i+1}">${m}</label>`;
      monthsGrid.append(d);
    });
  }

  // Modal Asignar sucursal
  btnAssign.addEventListener('click', () => {
    populateAssignForm();
    selBranch.value = '';
    selMonthCount.value = '1';
    assignModal.show();
  });
  btnSaveAssign.addEventListener('click', () => {
    const branch = selBranch.value;
    const months = Array.from(monthsGrid.querySelectorAll('input:checked'))
                       .map(cb => +cb.value)
                       .sort((a,b)=>a-b);
    const year   = +selAssignYear.value;
    if (!branch || !months.length) {
      return showAlert('Selecciona sucursal y meses.', 'warning');
    }
    assignments = assignments.filter(r => !(r.branch===branch && r.year===year));
    assignments.push({ branch, year, months });
    localStorage.setItem('psico_assignments', JSON.stringify(assignments));
    renderAssignments();
    assignModal.hide();
    showAlert('Asignación guardada.');
  });

  // Render de tabla de asignaciones
  function renderAssignments() {
    const tbody = document.querySelector('#assignTable tbody');
    tbody.innerHTML = '';
    assignments
      .sort((a,b) => a.year - b.year || a.months[0] - b.months[0])
      .forEach((r, idx) => {
        const start = `${String(r.months[0]).padStart(2,'0')}/01/${r.year}`;
        const endDay = new Date(r.year, r.months[r.months.length-1], 0).getDate();
        const end   = `${String(r.months[r.months.length-1]).padStart(2,'0')}/${endDay}/${r.year}`;
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${r.branch}</td>
          <td>${start} – ${end}</td>
          <td class="text-center">
            <button class="action-btn delete-assig" title="Eliminar asignación">
              <i class="bi bi-trash-fill"></i>
            </button>
          </td>`;
        // eliminar asignación
        tr.querySelector('.delete-assig').addEventListener('click', () => {
          if (!confirm('¿Eliminar esta asignación?')) return;
          assignments.splice(idx,1);
          localStorage.setItem('psico_assignments', JSON.stringify(assignments));
          renderAssignments();
          showAlert('Asignación eliminada.', 'danger');
        });
        tbody.append(tr);
      });
  }

  // Inicialización
  monthLabel.textContent = `${MONTH_NAMES[curMonth]} ${curYear}`;
  renderCalendar(curMonth,curYear,grid);
  renderAssignments();
});
