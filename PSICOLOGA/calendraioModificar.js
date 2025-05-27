document.addEventListener("DOMContentLoaded",() => {
   var currentURL = window.location.href;
   const params = new URLSearchParams(currentURL);
   const dateCita = params.get("dateCita"); 
   const time = params.get("time"); 



      document.getElementById("nuevoDia").value = dateCita;

      document.getElementById("nuevaHora").value = time;



        document.getElementById("btnAbrirModificarInputs").addEventListener("click", () => {
           document.getElementById("exitoModal").style.display = "flex";
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

});
