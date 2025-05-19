document.addEventListener("DOMContentLoaded", () => {
    const calendarContainer = document.getElementById("calendar-container");

    // Contenedor del calendario
    calendarContainer.innerHTML = `
        <div class="calendar-box">
            <div class="calendar-header">
                <button onclick="prevMonth()">❮</button>
                <h2 id="month-name">Septiembre</h2>
                <button onclick="nextMonth()">❯</button>
            </div>
            <div class="calendar-days">
                <div class="day">L</div>
                <div class="day">M</div>
                <div class="day">X</div>
                <div class="day">J</div>
                <div class="day">V</div>
            </div>
            <div id="calendar-dates" class="calendar-dates"></div>
            <div id="info-box" class="info-box">Selecciona una fecha para ver detalles.</div>
        </div>
    `;

    // Variables importantes
    const daysInMonth = 30;
    const appointments = [9, 12, 23, 25, 30]; // Días con citas
    const infoBox = document.getElementById("info-box");
    const datesContainer = document.getElementById("calendar-dates");

    // Función para renderizar el calendario
    function renderCalendar() {
        datesContainer.innerHTML = "";
        for (let i = 1; i <= daysInMonth; i++) {
            const dateEl = document.createElement("div");
            dateEl.classList.add("date");
            dateEl.textContent = i;

            // Añadir estrella si hay citas
            if (appointments.includes(i)) {
                dateEl.classList.add("star");
            }

            dateEl.addEventListener("click", () => selectDate(i, dateEl));
            datesContainer.appendChild(dateEl);
        }
    }

    // Selección de fecha
    function selectDate(day, element) {
        const allDates = document.querySelectorAll(".date");
        allDates.forEach((el) => el.classList.remove("selected"));

        element.classList.add("selected");

        if (appointments.includes(day)) {
            infoBox.innerHTML = `📅 Tienes una cita el <strong>${day}</strong>.`;
        } else {
            infoBox.innerHTML = `✅ Tu agenda está libre el <strong>${day}</strong>.`;
        }
    }

    // Funciones para cambiar el mes (solo visuales por ahora)
    window.prevMonth = function () {
        alert("Función para ir al mes anterior.");
    };

    window.nextMonth = function () {
        alert("Función para ir al siguiente mes.");
    };

    // Inicializar calendario
    renderCalendar();
});