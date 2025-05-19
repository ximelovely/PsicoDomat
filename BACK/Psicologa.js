
var clienteBD = conectarSQL();

function login(){

	var userInput = document.getElementById("userInput").val();


	var passInput = document.getElementById("passInput").val();

	conexion =  clienteBD.query("SELECT * FROM USERS WHERE USER = $userInput and PASS = $passInput");

	if (conexion.result != null){
		
		if(conexion.result.user == userInput && conexion.result.pass == passInput)
		{
				localStorage.setItem("user", conexion.result.USERID);
				console.log("login exitosos reenviar a la pagina de home");
		};
	}
	else
	{

		console.log("No existe usuario o hubo un error en la pass");
	}
}



function registrarCita(){
	var userInput = document.getElementById("userInput").val();

	var user =  localStorage.getItem("user");

	conexion =  clienteBD.query("INSERT INTO CITA ($fecha,$hora,$user)");

	if (conexion.result != null){
		
		$("#modalRegistroCitaExitosoFecha").html(conexion.result.fecha);
		$("#modalRegistroCitaExitosoHora").html(conexion.result.hora);
		$("#modalRegistroCitaExitosoPaciente").html(conexion.result.nombre);

		$("#modalRegistroCitaExitoso").show();
	}
	else
	{

		console.log("Consulta no exitosa");

	}
}

/*
function regitrso
insert tel, password a la tabla de usuarios

function login
select de user y pass, y regresar si es valido


function regitroCita
insert de la cita creada


function consultaCitas
te regresa la citas del mes seleccionado


function consultaCitaDia
te regresa las horas disponibles de un dia


function modificarCita
update que modifica una cita ya creada, el identidicador del update es el ID de la tabla de citas


function consultaPerfil
Te regresa la info de la psicologa


function updatePerfil
Update de la info de la psicologa


function consultarUbicaciones
Regresa la info de las ubicaciones guardadas

function registrarUbicacion
Insert de nuevas ubicaciones


function modificaUbicaciones
Update a las modificaciones guardadas


function agregarServicio
Insert de nuevos servicios

function modificarServicio
Update a los servicios guardados

function agregarPacientes
Insert de registro de nuevos pacientes

function registrarDiasNoLaborales
Insert de dias no laborables para el calendario
*/