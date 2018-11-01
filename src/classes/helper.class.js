
import idb from 'idb';

/*
Cuando se crea por primera vez la Base de datos, recoge de una api data para llenarla
*/
async function getDataFromAPI() {
    //Cargamos data de una API
    const url = "https://jsonplaceholder.typicode.com/todos?userId=1";
    let response = await fetch(url);
    let data = await response.json();
    let dbPromise = idb.open('TasksDB', 1);
    const db = await dbPromise;
    let tx = db.transaction('Tasks', 'readwrite');
    var store = tx.objectStore('Tasks');
    data.forEach(element => {
        let task = {
            name: element.title,
            done: element.completed
        }
        store.add(task);
    });
    tx.complete;
    printTable();
}

/*
Comprueba que la BBDD esta creada en el navegador y sino es asi la crea y la rellena de uan api
*/
function DBInit() {

    const databasename = "TasksDB";
    const version = 1;
    let db = idb.open(databasename, version, function (upgradeDb) {
        if (!upgradeDb.objectStoreNames.contains('Tasks')) {
            console.log('Creando una nueva object store (tabla)...');
            var tasksObjStore = upgradeDb.createObjectStore('Tasks', { keyPath: 'id', autoIncrement: true });
            tasksObjStore.createIndex('id', 'id', { unique: true });
            getDataFromAPI();
        }
    });

}

/*
Recorre toda la Base de datos y la pinta en pantalla.
*/
async function printTable() {

    let dbPromise = idb.open('TasksDB', 1);
    let db = await dbPromise;
    let tx = db.transaction('Tasks', 'readonly');
    let store = tx.objectStore('Tasks');
    let index = store.index('id');
    let data = await index.getAll();

    var tabla = document.getElementById("contenedortabla");
    var tr = "<table class='w3-bordered w3-table' id='tabla'>";
    tr += "<tr><th>Tareas</th><th>Acciones</th></tr>";
    data.forEach((t, index) => {
        tr += "<tr id='task-" + t.id + "'>";
        tr += "<td id='tname-" + t.id + "'";
        if (t.done) tr += " class='task-done' ";
        tr += ">" + t.name + "</td>";
        tr += "<td class='w3-display-container'> <span class='material-icons pointer w3-display-left' id='delete-" + t.id + "'>delete</span>";
        tr += "<span class='material-icons pointer w3-display-right' id='edit-" + t.id + "'>edit</span>";
        tr += "</td> </tr>";
    })
    tr += "</table>";
    tabla.innerHTML = tr;

}

//Actualiza el estado de una tarea
async function updateState(domElem) {
    let index = parseInt(domElem.substr(6));  //cuidadin con esto ¡¡¡!!!!
    let dbPromise = idb.open('TasksDB', 1);
    let db = await dbPromise;
    let tx = db.transaction('Tasks', 'readwrite');
    let store = tx.objectStore('Tasks');
    let task = await store.get(index);
    task.done = !task.done;
    await store.put(task);
    tx.complete;
    //Cambiamos la clase una vez actualizado
    if (!task.done) {
        document.getElementById(domElem).classList.remove("task-done");
    } else {
        document.getElementById(domElem).classList.add("task-done");
    }

}
// Borra una tarea y repinta la tabla en pantalla
async function deleteTask(index) {
    let dbPromise = idb.open('TasksDB', 1);
    let db = await dbPromise;
    let tx = db.transaction('Tasks', 'readwrite');
    let store = tx.objectStore('Tasks');
    await store.delete(parseInt(index));
    tx.complete;
    printTable();
}

// Inserta una tarea nueva y repinta la pantalla
async function insertTask(newtask) {
    let dbPromise = idb.open('TasksDB', 1);
    const db = await dbPromise;
    let tx = db.transaction('Tasks', 'readwrite');
    let store = tx.objectStore('Tasks');
    let task = {
        name: newtask,
        done: false
    }
    await store.add(task);
    tx.complete;
    printTable();
}

// Busca y recupera la tarea a Editar y lo lleva al formulario
async function getTask(domElem) {
    let id = domElem.substr(5);
    let dbPromise = idb.open('TasksDB', 1);
    let db = await dbPromise;
    let tx = db.transaction('Tasks', 'readwrite');
    let store = tx.objectStore('Tasks');
    let task = await store.get(parseInt(id));
    //Actualizamos el DOM
    document.getElementById("idTask").value = id;
    document.getElementById("txtTask").value = task.name;
    document.getElementById("btnTask").firstChild.data = "Editar";
    document.getElementById("txtTask").focus();
    //Añadimos un boton de cancelar
    document.getElementById("btnCancelar").classList.remove("w3-hide");
    
}

//Actualizamos la nueva tarea en la BBDD
async function updateTask(id,newtask){
    let dbPromise = idb.open('TasksDB', 1);
    let db = await dbPromise;
    let tx = db.transaction('Tasks', 'readwrite');
    let store = tx.objectStore('Tasks');
    let task = await store.get(parseInt(id));
    task.name=newtask;
    await store.put(task);
    tx.complete;
    printTable();
    //Actualizamos el DOM
    document.getElementById("btnTask").firstChild.data = "Añadir";
    document.getElementById("txtTask").value ="";
    document.getElementById("txtTask").focus();
    document.getElementById("btnCancelar").classList.add("w3-hide");
}



export default {
    DBInit: DBInit,
    printTable: printTable,
    updateState: updateState,
    deleteTask: deleteTask,
    insertTask: insertTask,
    getTask: getTask,
    updateTask: updateTask
};