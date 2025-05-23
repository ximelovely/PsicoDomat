// AgregarUbicacion.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formAddLocation');
  const imgInput = document.getElementById('loc-image');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const name    = document.getElementById('loc-name').value.trim();
    const address = document.getElementById('loc-address').value.trim();
    const cost    = document.getElementById('loc-cost').value.trim();
    const file    = imgInput.files[0] || null;

    if (!name || !address || !cost) {
      return alert('Por favor completa todos los campos.');
    }

    // Simulación de subida de imagen y guardado
    let imageUrl = '../IMÁGENES/consultorio.png';
    if (file) {
      // aquí podrías subirlo a tu servidor y obtener URL
      imageUrl = URL.createObjectURL(file);
    }

    // Lee el arreglo de locations de LocalStorage
    const STORAGE_KEY = 'psico_locations';
    const arr = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

    // Agrega la nueva
    arr.push({
      id: Date.now(),
      nombre: name,
      direccion: address,
      costo,
      imagen: imageUrl
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));

    // Redirige de vuelta a Editar Ubicaciones
    alert('Ubicación guardada correctamente.');
    window.location.href = 'ubis.html';
  });
});
