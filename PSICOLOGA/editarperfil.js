document.addEventListener("DOMContentLoaded", () => {
  const descripcion = document.getElementById("descripcion");
  const contador = document.getElementById("contador");

  function actualizarContador() {
    contador.textContent = `${descripcion.value.length}/500`;
  }

  descripcion.addEventListener("input", actualizarContador);
  actualizarContador(); // actualizar al cargar
});
