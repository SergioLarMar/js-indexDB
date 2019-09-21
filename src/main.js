require('./w3.css');     // W3.css
require('./main.css');  //Si precisamos de otro fichero adicional de CSS


import "@babel/polyfill";
import DBHelper from './classes/helper';


DBHelper.DBInit(); // Inicializa la BDD y la carga con datos remotos de una API



// Seccion de eventos
document.addEventListener('DOMContentLoaded', function () {

    DBHelper.printTable();  // Pinta los datos en pantalla

    document.getElementById("btnTask").addEventListener("click", function (event) {
        event.preventDefault();
        var accion = document.getElementById("btnTask").firstChild.data;
        let task = (document.getElementById("txtTask").value).trim();
        //si esta vacio salta la capa oculta con el error
        if (task === "") {
            document.getElementById("error").classList.remove("w3-hide");
            document.getElementById("msg").innerText = "Debe de teclear una tarea";
            return;
        }
        //si la accion es añair llamamos al metodo insertTask
        if (accion === "Añadir") {
            DBHelper.insertTask(task);

        }
        //si la accion es editar llamamos al metodo updateTask cogiendo el valor del campo oculto para actualizar el indexDB
        if (accion === "Editar") {
            //capturamos el id del campo oculto para actualizarlo en el indexDB
            DBHelper.updateTask(document.getElementById("idTask").value, task);
        }
        //vaciamos el campo texto que hemos actulizado o añadido al pulsar el evento
        document.getElementById("txtTask").value = "";

    });
//si se clicka en el boton error de la alerta ocultamos la capa
    document.getElementById("btnError").addEventListener("click", function (event) {
        document.getElementById("error").classList.add("w3-hide");
    });
//Si clicamos el boton cancelar se realizan las operaciones contrarias para oculta editar y mostrar añadir
    document.getElementById("btnCancelar").addEventListener("click", function (event) {
        event.preventDefault();
        document.getElementById("btnTask").firstChild.data = "Añadir";
        document.getElementById("txtTask").value ="";
        document.getElementById("txtTask").focus();
        document.getElementById("btnCancelar").classList.add("w3-hide");
    });
//eventos, un listener que traslada que evento se dispara para realizar el delete y el edit/update en los metodos del helper
    var eventosTabla = function () {
        document.getElementById("contenedortabla").addEventListener("click", function (event) {
            console.log(event.target.id);
            //variable donde se captura el id del evento que se dispara
            var domElem = event.target.id;
            //funcion para actualizar el estado la tarea
            if (domElem.indexOf('tname') == 0) {
                DBHelper.updateState(domElem);

            }
            //si se pulsa el delete se llama al metodo deleteTask y se pasa el id a borrar
            if (domElem.indexOf('delete') == 0) {
                if (confirm("Desea borrar la tarea?")) {
                    DBHelper.deleteTask(domElem.substr(7));
                }
            }
            //si se pulsa edit se llama al metodo getTask y lo lleva al formulario para editar
            if (domElem.indexOf('edit') == 0) {
                DBHelper.getTask(domElem);

            }
        })
    };
    eventosTabla();
})