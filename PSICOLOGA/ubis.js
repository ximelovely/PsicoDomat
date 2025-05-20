let ubicaciones = [
  {
    id: 1,
    nombre: "Monterrey, N.L.",
    direccion: "Av No Reelección 501, Barrio Morga, 64000 Monterrey, N.L.",
    costo: "$599MXN",
    imagen: "../IMÁGENES/monterrey_map.png"
  },
  {
    id: 2,
    nombre: "Houston, Tx.",
    direccion: "4914 Bissonnet St #200, Bellaire, TX 77401, Estados Unidos",
    costo: "$50USD",
    imagen: "../IMÁGENES/houston_map.png"
  }
];

let editandoId = null;

const contenedor = document.getElementById("ubicaciones-list");
const modal = document.getElementById("ubicacionModal");
const btnAgregar = document.getElementById("btnAgregarUbicacion");
const btnCerrar = document.getElementById("btnCerrarModal");
const btnGuardar = document.getElementById("btnGuardarUbicacion");
const inputDireccion = document.getElementById("direccion");
const inputCosto = document.getElementById("costo");
const modalTitle = document.getElementById("modalTitle");

btnAgregar.style.backgroundColor = "#E98D6F";
btnAgregar.style.color = "white";
btnAgregar.style.border = "none";
btnAgregar.style.padding = "12px 50px";
btnAgregar.style.borderRadius = "100px";
btnAgregar.style.fontFamily = "'Louis George Cafe', sans-serif";
btnAgregar.style.fontSize = "16px";

function renderizarUbicaciones() {
  contenedor.innerHTML = "";
  ubicaciones.forEach((u) => {
    const card = document.createElement("div");
    card.className = "ubicacion-card";
    card.style.padding = "25px";
    card.style.alignItems = "center";
    card.style.justifyContent = "flex-start";
    card.innerHTML = `
      <img src="${u.imagen}" alt="consultorio" style="width: 100px; height: 100px; border-radius: 15px; object-fit: cover; margin-right: 20px;">
      <div class="ubicacion-text" style="flex-grow: 1;">
        <h5>${u.nombre}</h5>
        <p>${u.direccion}</p>
        <p>Costo: ${u.costo}</p>
      </div>
      <div class="edit-icon" onclick="editarUbicacion(${u.id})">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16">
          <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V12h2.293l6.5-6.5z"/>
        </svg>
      </div>`;
    card.style.display = "flex";
    contenedor.appendChild(card);
  });
}

function editarUbicacion(id) {
  const ub = ubicaciones.find(u => u.id === id);
  if (!ub) return;
  editandoId = id;
  inputDireccion.value = ub.direccion;
  inputCosto.value = ub.costo;
  modalTitle.textContent = "Editar ubicación";
  modal.classList.remove("hidden");
}

btnAgregar.onclick = () => {
  editandoId = null;
  inputDireccion.value = "";
  inputCosto.value = "";
  modalTitle.textContent = "Agregar nueva ubicación";
  modal.classList.remove("hidden");
};

btnCerrar.onclick = () => {
  modal.classList.add("hidden");
};

function editarUbicacion(id) {
  const ubicacion = ubicaciones.find(u => u.id === id);
  if (!ubicacion) return;
  localStorage.setItem("ubicacionEditar", JSON.stringify(ubicacion));
  window.location.href = "editar_ubicacion.html";
}

btnGuardar.onclick = () => {
  const direccion = inputDireccion.value.trim();
  const costo = inputCosto.value.trim();
  if (!direccion || !costo) return alert("Por favor llena todos los campos");

  if (editandoId) {
    const index = ubicaciones.findIndex(u => u.id === editandoId);
    if (index !== -1) {
      ubicaciones[index].direccion = direccion;
      ubicaciones[index].costo = costo;
    }
  } else {
    const nombre = prompt("Nombre de la sucursal:");
    if (!nombre) return;
    const nuevaUbicacion = {
      id: Date.now(),
      nombre,
      direccion,
      costo,
      imagen: "../IMÁGENES/consultorio.png"
    };
    ubicaciones.push(nuevaUbicacion);
  }

  modal.classList.add("hidden");
  renderizarUbicaciones();
};

renderizarUbicaciones();
