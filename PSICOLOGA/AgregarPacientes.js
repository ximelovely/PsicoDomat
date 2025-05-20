// AgregarPacientes.js
document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY        = 'psico_patients';
  const alertPlaceholder   = document.getElementById('alertPlaceholder');
  const tableBody          = document.querySelector('#patientTable tbody');
  const btnOpenAdd         = document.getElementById('btnOpenAddPatient');
  const addModal           = new bootstrap.Modal('#addPatientModal');
  const formAdd            = document.getElementById('formAddPatient');
  const btnSaveAdd         = document.getElementById('btnSavePatient');
  const btnSearch          = document.getElementById('btnSearch');
  const inputSearch        = document.getElementById('search-phone');

  const editModal          = new bootstrap.Modal('#editPatientModal');
  const formEdit           = document.getElementById('formEditPatient');
  const btnSaveEditPat     = document.getElementById('btnSaveEditPatient');

  const selectDay          = document.getElementById('birth-day');
  const selectMonth        = document.getElementById('birth-month');
  const selectYear         = document.getElementById('birth-year');
  const selectEditDay      = document.getElementById('edit-birth-day');
  const selectEditMonth    = document.getElementById('edit-birth-month');
  const selectEditYear     = document.getElementById('edit-birth-year');

  // Helpers localStorage
  const getPatients = () =>
    JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const setPatients = arr =>
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));

  // Mostrar alerta
  function showAlert(msg, type='success') {
    alertPlaceholder.innerHTML = `
      <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${msg}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>`;
  }

  // Rellenar selects de fecha (alta y edición)
  function populateDateSelectors() {
    for (let d = 1; d <= 31; d++) {
      [selectDay, selectEditDay].forEach(sel => {
        const o = document.createElement('option');
        o.value = d; o.textContent = d;
        sel.append(o);
      });
    }
    const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                   'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    meses.forEach((m, i) => {
      [selectMonth, selectEditMonth].forEach(sel => {
        const o = document.createElement('option');
        o.value = i+1; o.textContent = m;
        sel.append(o);
      });
    });
    const thisYear = new Date().getFullYear();
    for (let y = thisYear; y >= thisYear - 100; y--) {
      [selectYear, selectEditYear].forEach(sel => {
        const o = document.createElement('option');
        o.value = y; o.textContent = y;
        sel.append(o);
      });
    }
  }

  // Render de la tabla (con acciones)
  function renderTable(filter = '') {
    const arr = getPatients().filter(p => p.phone.includes(filter));
    tableBody.innerHTML = '';
    if (!arr.length) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center text-muted">
            No hay pacientes.
          </td>
        </tr>`;
      return;
    }
    arr.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${p.name}</td>
        <td>${p.last}</td>
        <td>${p.phone}</td>
        <td>${p.birth}</td>
        <td class="text-center">
          <button class="action-btn edit-pat"><i class="bi bi-pencil-fill"></i></button>
          <button class="action-btn del-pat"><i class="bi bi-trash-fill"></i></button>
        </td>`;
      // Editar
      tr.querySelector('.edit-pat')
        .addEventListener('click', () => openEditPatientModal(p.id));
      // Eliminar
      tr.querySelector('.del-pat').addEventListener('click', () => {
        if (!confirm('¿Eliminar este paciente?')) return;
        const remaining = getPatients().filter(x => x.id !== p.id);
        setPatients(remaining);
        renderTable(inputSearch.value.trim());
        showAlert('Paciente eliminado correctamente.', 'success');
      });
      tableBody.append(tr);
    });
  }

  // Abrir modal de alta
  btnOpenAdd.addEventListener('click', () => {
    formAdd.reset();
    addModal.show();
  });

  // Guardar nuevo paciente
  btnSaveAdd.addEventListener('click', () => {
    const name  = document.getElementById('pat-name').value.trim();
    const last  = document.getElementById('pat-last').value.trim();
    const phone = document.getElementById('pat-phone').value.trim();
    const pass  = document.getElementById('pat-pass').value;
    const day   = selectDay.value;
    const mon   = selectMonth.value;
    const year  = selectYear.value;

    if (!name || !last || !phone || !pass || !day || !mon || !year) {
      return showAlert('Completa todos los campos.', 'warning');
    }
    const birth = `${String(day).padStart(2,'0')}/` +
                  `${String(mon).padStart(2,'0')}/${year}`;

    const arr = getPatients();
    arr.push({ id: Date.now(), name, last, phone, birth });
    setPatients(arr);

    renderTable(inputSearch.value.trim());
    addModal.hide();
    showAlert('Paciente registrado correctamente.', 'success');
  });

  // Abrir modal de edición
  function openEditPatientModal(id) {
    const pat = getPatients().find(x => x.id === id);
    if (!pat) {
      return showAlert('Paciente no encontrado.', 'danger');
    }
    document.getElementById('edit-pat-id').value        = pat.id;
    document.getElementById('edit-pat-name').value      = pat.name;
    document.getElementById('edit-pat-last').value      = pat.last;
    document.getElementById('edit-pat-phone').value     = pat.phone;
    const [dd, mm, yy] = pat.birth.split('/');
    selectEditDay.value   = dd;
    selectEditMonth.value = mm;
    selectEditYear.value  = yy;
    document.getElementById('edit-pat-pass').value = '';
    formEdit.reset();
    editModal.show();
  }

  // Guardar edición de paciente
  btnSaveEditPat.addEventListener('click', () => {
    const id    = +document.getElementById('edit-pat-id').value;
    const name  = document.getElementById('edit-pat-name').value.trim();
    const last  = document.getElementById('edit-pat-last').value.trim();
    const phone = document.getElementById('edit-pat-phone').value.trim();
    const pass  = document.getElementById('edit-pat-pass').value;
    const day   = selectEditDay.value;
    const mon   = selectEditMonth.value;
    const year  = selectEditYear.value;

    if (!name || !last || !phone || !pass || !day || !mon || !year) {
      return showAlert('Completa todos los campos.', 'warning');
    }
    const birth = `${String(day).padStart(2,'0')}/` +
                  `${String(mon).padStart(2,'0')}/${year}`;

    let arr = getPatients();
    const idx = arr.findIndex(x => x.id === id);
    if (idx < 0) {
      return showAlert('Paciente no encontrado.', 'danger');
    }
    arr[idx] = { id, name, last, phone, birth };
    setPatients(arr);

    renderTable(inputSearch.value.trim());
    editModal.hide();
    showAlert('Datos del paciente actualizados.', 'success');
  });

  // Búsqueda
  btnSearch.addEventListener('click', () => {
    renderTable(inputSearch.value.trim());
  });
  inputSearch.addEventListener('keyup', () => {
    renderTable(inputSearch.value.trim());
  });

  // Inicialización
  populateDateSelectors();
  renderTable();
});
