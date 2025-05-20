// EditarServicios.js
document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY      = 'psico_services';
  const alertPlaceholder = document.getElementById('alertPlaceholder');
  const serviceList      = document.getElementById('serviceList');
  const addModal         = new bootstrap.Modal('#addServiceModal');
  const editModal        = new bootstrap.Modal('#editServiceModal');
  const formAdd          = document.getElementById('formAddService');
  const formEdit         = document.getElementById('formEditService');
  const btnOpenAdd       = document.getElementById('btnOpenAdd');
  const btnSaveAdd       = document.getElementById('btnSaveAdd');
  const btnSaveEdit      = document.getElementById('btnSaveEdit');
  const btnDelete        = document.getElementById('btnDelete');
  const inputEditName    = document.getElementById('edit-name');
  const spanCharCount    = document.querySelector('.char-count');
  const imgCurrentIcon   = document.getElementById('current-icon');

  // localStorage helpers
  const getServices = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const setServices = arr => localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));

  // Alert
  function showAlert(msg, type = 'success') {
    alertPlaceholder.innerHTML = `
      <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${msg}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>`;
  }

  // Render lista de servicios con su imagen
  function renderList() {
    const services = getServices();
    serviceList.innerHTML = '';

    if (!services.length) {
      serviceList.innerHTML = `<li class="text-center text-muted">No hay servicios.</li>`;
      return;
    }

    services.forEach(s => {
      const li = document.createElement('li');
      li.className = 'serv-item d-flex align-items-center';
      li.dataset.id = s.id;
      li.innerHTML = `
        <img src="${s.iconUrl}" alt="${s.name}" class="serv-icon">
        <span class="flex-grow-1">${s.name}</span>
        <button class="btn-edit-item btn btn-link text-dark">
          <i class="bi bi-pencil-fill"></i>
        </button>`;
      li.querySelector('.btn-edit-item')
        .addEventListener('click', () => openEditModal(s.id));
      serviceList.appendChild(li);
    });
  }

  // Abrir modal Agregar
  btnOpenAdd.addEventListener('click', () => {
    formAdd.reset();
    addModal.show();
  });

  // Guardar servicio nuevo
  btnSaveAdd.addEventListener('click', () => {
    const name = document.getElementById('add-name').value.trim();
    const file = document.getElementById('add-icon').files[0];
    if (!name || !file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const services = getServices();
      services.push({ id: Date.now(), name, iconUrl: reader.result });
      setServices(services);
      renderList();
      addModal.hide();
      showAlert('Servicio agregado correctamente.');
    };
    reader.readAsDataURL(file);
  });

  // Abrir modal Editar
  function openEditModal(id) {
    const services = getServices();
    const s = services.find(x => x.id === id);
    if (!s) {
      return showAlert('Servicio no encontrado', 'danger');
    }
    document.getElementById('edit-id').value = s.id;
    inputEditName.value = s.name;
    spanCharCount.textContent = `${s.name.length}/50`;
    imgCurrentIcon.src = s.iconUrl;
    formEdit.reset();
    editModal.show();
  }

  // Contador de caracteres
  inputEditName.addEventListener('input', () => {
    spanCharCount.textContent = `${inputEditName.value.length}/50`;
  });

  // Vista previa de nuevo icono en Editar
  document.getElementById('edit-icon').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => imgCurrentIcon.src = reader.result;
    reader.readAsDataURL(file);
  });

  // Guardar cambios de edición
  btnSaveEdit.addEventListener('click', () => {
    const id   = +document.getElementById('edit-id').value;
    const name = inputEditName.value.trim();
    const file = document.getElementById('edit-icon').files[0];
    let services = getServices();
    const idx = services.findIndex(x => x.id === id);
    if (idx < 0) return showAlert('Servicio no encontrado', 'danger');
    services[idx].name = name;
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        services[idx].iconUrl = reader.result;
        finalizeEdit(services);
      };
      reader.readAsDataURL(file);
    } else {
      finalizeEdit(services);
    }
  });

  function finalizeEdit(services) {
    setServices(services);
    renderList();
    editModal.hide();
    showAlert('Servicio actualizado correctamente.');
  }

  // Eliminar servicio
  btnDelete.addEventListener('click', () => {
    const id = +document.getElementById('edit-id').value;
    if (!confirm('¿Eliminar este servicio?')) return;
    const services = getServices().filter(x => x.id !== id);
    setServices(services);
    renderList();
    editModal.hide();
    showAlert('Servicio eliminado correctamente.');
  });

  // Init
  renderList();
});
