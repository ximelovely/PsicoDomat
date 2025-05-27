document.addEventListener("DOMContentLoaded",() => {
   var currentURL = window.location.href;
   const params = new URLSearchParams(currentURL);
   const dateCita = params.get("dateCita"); 
   const time = params.get("time"); 
   const nombre = params.get("nombre"); 
   const motivo = params.get("motivo"); 
   const dob = params.get("dob"); 
   const sucursal = params.get("sucursal"); 


   document.getElementById("modalDate").textContent = dateCita;  
   document.getElementById("modalTime").textContent = time;
   document.getElementById("modalInfo").innerHTML = `
    <p><strong>Nombre:</strong> ${nombre}</p>  
    <p><strong>Motivo:</strong> ${motivo}</p>
    <p><strong>Fecha de nacimiento:</strong> ${dob}</p>
    <p><strong>Sucursal:</strong> ${sucursal}</p>
    `;


        document.getElementById("btnAbrirModificar").addEventListener("click", () => {
           window.location.href = `CalendarioModificar.html?date=${dateCita}&time=${time}&dateCita=${dateCita}`;
         });
      


        document.getElementById("goCalendar").addEventListener("click", () => {
          window.location.href = "Calendario.html";
         });

          document.getElementById("goCalendarCancelacion").addEventListener("click", () => {
          window.location.href = "Calendario.html";
         });



         document.getElementById("cancelarCita").addEventListener("click", () => {
           document.getElementById("modalConfirmacionCancelar").style.display = "flex";
           document.getElementById("modal").style.display = "none";

         });

          document.getElementById("submitCancelar").addEventListener("click", () => {
           document.getElementById("modalCitaCancelada").style.display = "flex";
           document.getElementById("modalConfirmacionCancelar").style.display = "none";

         });


          document.getElementById("btnAbrirModificarCancelar").addEventListener("click", () => {
           document.getElementById("modificar-container").style.display = "flex";
           document.getElementById("modalConfirmacionCancelar").style.display = "none";

           document.getElementById("calendarDetalles").style.display = "none";
           document.getElementById("modal").style.display = "none";

           document.getElementById("nuevoDia").value = cita.date;

           document.getElementById("nuevaHora").value = cita.time;

         });

});
