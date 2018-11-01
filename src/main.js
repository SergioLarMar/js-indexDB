require('./w3.css');     // W3.css
require('./main.css');  //Si precisamos de otro fichero adicional de CSS


import "@babel/polyfill";
import DBHelper from './classes/helper.class';


DBHelper.DBInit(); // Inicializa la BDD y la carga con datos remotos de una API



// Seccion de eventos
document.addEventListener('DOMContentLoaded', function () {

    DBHelper.printTable();  // Pinta los datos en pantalla

    document.getElementById("btnTask").addEventListener("click", function (event) {
        event.preventDefault();
        var accion = document.getElementById("btnTask").firstChild.data;
        let task = (document.getElementById("txtTask").value).trim();
        if (task === "") {
            document.getElementById("error").classList.remove("w3-hide");
            document.getElementById("msg").innerText = "Debe de teclear una tarea";
            return;
        }
        if (accion === "Añadir") {
            DBHelper.insertTask(task);

        }
        if (accion === "Editar") {
            DBHelper.updateTask(document.getElementById("idTask").value, task);
        }
        document.getElementById("txtTask").value = "";

    });

    document.getElementById("btnError").addEventListener("click", function (event) {
        document.getElementById("error").classList.add("w3-hide");
    });

    document.getElementById("btnCancelar").addEventListener("click", function (event) {
        event.preventDefault();
        document.getElementById("btnTask").firstChild.data = "Añadir";
        document.getElementById("txtTask").value ="";
        document.getElementById("txtTask").focus();
        document.getElementById("btnCancelar").classList.add("w3-hide");
    });

    var eventosTabla = function () {
        document.getElementById("contenedortabla").addEventListener("click", function (event) {
            console.log(event.target.id);
            var domElem = event.target.id;
            if (domElem.indexOf('tname') == 0) {
                DBHelper.updateState(domElem);

            }
            if (domElem.indexOf('delete') == 0) {
                if (confirm("Desea borrar la tarea?")) {
                    DBHelper.deleteTask(domElem.substr(7));
                }
            }
            if (domElem.indexOf('edit') == 0) {
                DBHelper.getTask(domElem);

            }
        })
    };
    eventosTabla();
})