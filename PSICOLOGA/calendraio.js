document.addEventListener("DOMContentLoaded",() => {
  const calendarContainer = document.getElementById("calendar-container");

  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();


  var citas = {
    "2025-09-09": {
      time: "09:00",
      name: "Luis Pérez",
      reason: "Terapia individual",
      dob: "12/05/1990",
      branch: "Monterrey",
      id: "1"
    },
    "2025-09-12": {
      time: "10:30",
      name: "Ana García",
      reason: "Terapia de pareja",
      dob: "21/08/1985",
      branch: "Houston",
      id: "2"
    },
    "2025-09-23": {
      time: "15:00",
      name: "Carlos Ramírez",
      reason: "Evaluación psicológica",
      dob: "03/03/1979",
      branch: "Monterrey",
      id: "3"
    }
  };

  const monthName = document.getElementById("month-name");
  const datesContainer = document.getElementById("calendar-dates");
  const infoBox = document.getElementById("info-box");

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  function renderCalendar(year, month) {
    datesContainer.innerHTML = "";
    monthName.textContent = `${monthNames[month]} ${year}`;
    console.log(`📆 Renderizando: ${monthNames[month]} ${year}`);

    const firstDayDate = new Date(year, month, 1);
    const totalDays = new Date(year, month + 1, 0).getDate();
    const firstWeekday = firstDayDate.getDay(); // 0 (Dom) - 6 (Sáb)

    const offset = firstWeekday === 0 ? 6 : firstWeekday - 1;
    console.log(`📌 Primer día del mes (${year}-${month + 1}-01) es: ${firstDayDate.toLocaleString('es-MX', { weekday: 'long' })} [offset: ${offset}]`);

    for (let i = 0; i < offset; i++) {
      const empty = document.createElement("div");
      empty.classList.add("date");
      empty.style.visibility = "hidden";
      datesContainer.appendChild(empty);
    }

    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(year, month, i);
      const jsDay = date.getDay();
      if (jsDay < 1 || jsDay > 5) continue;

      const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      const div = document.createElement("div");
      div.classList.add("date");
      div.textContent = i;

      if (citas[dateKey]) {
        div.classList.add("star");
        console.log(`⭐ Fecha con cita: ${dateKey}`);
      }

      div.addEventListener("click", () => seleccionarFecha(dateKey, i, div));
      datesContainer.appendChild(div);
    }
  }


  function seleccionarFecha(key, dayNumber, el) {
    document.querySelectorAll(".date").forEach(d => d.classList.remove("selected"));
    el.classList.add("selected");

    console.log(`🖱️ Fecha seleccionada: ${key}`);

    const cita = citas[key];

    if (cita) {

      document.getElementById("calendar-details").innerHTML = `
        <div class="d-flex"><h5><strong>${cita.time}</strong></h5></div>
        <div class="d-flex ml-2"><h6><strong>Motivo: ${cita.reason}</strong></h6></div>
        <div class="d-flex justify-content-between">
          <h6><strong>Nombre: ${cita.name}</strong><h6>
          <span id="options-${cita.id}" class="justify-content-right option-cita"><strong><svg xmlns="http://www.w3.org/2000/svg" width="20" height="16" fill="white" class="bi bi-three-dots" viewBox="0 0 16 16">
          <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"/>
            </svg> 
            </span>
        </div>
      `;

       document.getElementById("options-" + cita.id).addEventListener("click", function citaDetail(){

        document.getElementById("modal").classList.remove("hidden");
        document.getElementById("modal").style.display = "flex";
        document.getElementById("modalDate").textContent = key;  
        document.getElementById("modalTime").textContent = cita.time;
        document.getElementById("modalInfo").innerHTML = `
          <p><strong>Nombre:</strong> ${cita.name}</p>  
          <p><strong>Motivo:</strong> ${cita.reason}</p>
          <p><strong>Fecha de nacimiento:</strong> ${cita.dob}</p>
          <p><strong>Sucursal:</strong> ${cita.branch}</p>
        `;

       });

    } else {
      console.log("ℹ️ Día libre, sin cita.");
      document.getElementById("calendar-details").innerHTML =`Tu agenda esta libre el ${dayNumber}. No hay citas agendadas`;
    }
  }

  document.getElementById("prevBtn").addEventListener("click", () => {
    if (currentMonth === 0) {
      currentMonth = 11;
      currentYear--;
    } else {
      currentMonth--;
    }
    console.log("⬅️ Mes anterior");
    renderCalendar(currentYear, currentMonth);
  });

  document.getElementById("nextBtn").addEventListener("click", () => {
    if (currentMonth === 11) {
      currentMonth = 0;
      currentYear++;
    } else {
      currentMonth++;
    }
    console.log("➡️ Mes siguiente");
    renderCalendar(currentYear, currentMonth);
  });

  document.getElementById("closeModal").addEventListener("click", () => {
    console.log("❌ Cerrando modal");
    document.getElementById("modal").classList.add("hidden");
    document.getElementById("modal").style.display = "none";
  });

  document.getElementById("btnAbrirModificar").addEventListener("click", () => {
    console.log("🛠 Abriendo modificación");
    document.getElementById("modal").classList.add("hidden");
    document.getElementById("modificarModal").classList.remove("hidden");
    generarFechasValidas();
  });

  document.getElementById("btnConfirmarModificacion").addEventListener("click", () => {
    console.log("✔️ Modificación confirmada");
    document.getElementById("modificarModal").classList.add("hidden");
    document.getElementById("exitoModal").classList.remove("hidden");
  });

  function generarFechasValidas() {
    const fechaInput = document.getElementById("nuevoDia");
    const hoy = new Date();
    const fechasValidas = [];

    for (let i = 0; i < 60; i++) {
      const dia = new Date(hoy);
      dia.setDate(hoy.getDate() + i);
      const semana = dia.getDay();
      if (semana >= 1 && semana <= 5) {
        fechasValidas.push(dia.toISOString().split("T")[0]);
      }
    }

    console.log("📅 Días válidos generados:", fechasValidas);

    fechaInput.setAttribute("min", fechasValidas[0]);
    fechaInput.setAttribute("max", fechasValidas[fechasValidas.length - 1]);

    fechaInput.addEventListener("input", () => {
      if (!fechasValidas.includes(fechaInput.value)) {
        fechaInput.setCustomValidity("Elige un día hábil (L-V)");
        fechaInput.reportValidity();
        fechaInput.value = "";
      } else {
        fechaInput.setCustomValidity("");
      }
    });
  }

  renderCalendar(currentYear, currentMonth);

});
