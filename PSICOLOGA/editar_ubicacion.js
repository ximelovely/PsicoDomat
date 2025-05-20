document.addEventListener("DOMContentLoaded", () => {
  const nombreInput = document.getElementById("nombre");
  const direccionInput = document.getElementById("direccion");
  const costoInput = document.getElementById("costo");
  const monedaSelect = document.getElementById("moneda");
  const horaInicio = document.getElementById("horaInicio");
  const horaFin = document.getElementById("horaFin");
  const imagen = document.getElementById("imagenUbicacion");

  const btnEditar = document.querySelector(".btn-editar");
  const btnEliminar = document.querySelector(".btn-eliminar");

  const ubicacion = JSON.parse(localStorage.getItem("ubicacionEditando"));

  if (ubicacion) {
    nombreInput.value = ubicacion.nombre || "";
    direccionInput.value = ubicacion.direccion || "";
    const valor = ubicacion.costo || "";
    if (valor.includes("USD")) {
      costoInput.value = valor.replace(/[^\d.]/g, "");
      monedaSelect.value = "USD";
    } else {
      costoInput.value = valor.replace(/[^\d.]/g, "");
      monedaSelect.value = "MXN";
    }
    imagen.src = ubicacion.imagen || "../IMÁGENES/consultorio.png";
  }

  btnEditar.addEventListener("click", () => {
    const actualizada = {
      ...ubicacion,
      nombre: nombreInput.value.trim(),
      direccion: direccionInput.value.trim(),
      costo: `$${costoInput.value.trim()}${monedaSelect.value}`,
      horaInicio: horaInicio.value,
      horaFin: horaFin.value,
      imagen: imagen.src
    };

    localStorage.setItem("ubicacionActualizada", JSON.stringify(actualizada));
    document.getElementById("modalConfirmacion").classList.remove("hidden");document.getElementById("modalConfirmacion").style.display = "flex";

  });


window.addEventListener("DOMContentLoaded", () => {
  const datos = localStorage.getItem("ubicacionEditar");
  if (!datos) return;

  const ubicacion = JSON.parse(datos);
  document.getElementById("nombre").value = ubicacion.nombre;
  document.getElementById("direccion").value = ubicacion.direccion;
  document.getElementById("costo").value = parseInt(ubicacion.costo.replace(/[^\d]/g, ""));
  document.getElementById("moneda").value = ubicacion.costo.includes("USD") ? "USD" : "MXN";
  document.getElementById("imagenUbicacion").src = ubicacion.imagen;

  document.getElementById("count-nombre").textContent = `${ubicacion.nombre.length}/50`;
  document.getElementById("count-direccion").textContent = `${ubicacion.direccion.length}/100`;
});

  btnEliminar.addEventListener("click", () => {
    const confirmar = confirm("¿Estás seguro que deseas eliminar esta ubicación?");
    if (confirmar) {
      localStorage.setItem("ubicacionEliminada", ubicacion.id);
      alert("Ubicación eliminada");
      window.location.href = "ubis.html";
    }
  });
});

