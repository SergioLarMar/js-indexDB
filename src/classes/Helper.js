import idb from 'idb';




/*
Comprueba que la BBDD esta creada en el navegador y sino es asi la crea y la rellena de uan api
*/
function DBInit() {
    //Iniciamos las constantes de la BBDD
    const databasename = "TasksDB";
    const version = 1;
    //Abrimos la BBDD IndexDB con el IDB.js, pasamos version, database y callback
    let db = idb.open(databasename, version, function (upgradeDb) {
        if (!upgradeDb.objectStoreNames.contains('Tasks')) {
            console.log('Creando una nueva object store (tabla)...');
            //resgistramos el store y sus valores añadiendo id como autoincremental
            var tasksObjStore = upgradeDb.createObjectStore('Tasks', {
                keyPath: 'id',
                autoIncrement: true
            });
            //iniciamos los index que queremos crear
            tasksObjStore.createIndex('id', 'id', {
                unique: true
            });
            tasksObjStore.createIndex('name', 'name', {
                unique: false
            });
            /*no se traga el booleano
            tasksObjStore.createIndex('done', 'done', {
                unique: false
            });*/
            //llamamos a la funcion getDataFromAPI() para recoger la data de la API
            getDataFromAPI();
        }
    });

}


/*
Cuando se crea por primera vez la Base de datos, recoge de una api data para llenarla

funciones arrow: http://www.jaimeolmo.com/2018/06/funciones-arrow/  uso del this y el binding solucion con funciones arrow
                 https://frontendlabs.io/3410--funciones-flecha-arrow-es6-javascript-tutorial-ecmascript-6
                 https://desarrolloweb.com/articulos/arrow-functions-es6.html

*/
async function getDataFromAPI() {
    //Cargamos data de una API
    const url = "https://jsonplaceholder.typicode.com/todos?userId=1";
    //Usar asincronamente fetch para tirar de la API, fichero o lo que se quiera
    let response = await fetch(url);
    //recoger en una promise con await en json el resultado
    let data = await response.json();
    //abrir la base datos IndexDB con el metodo de IDB.js
    let dbPromise = idb.open('TasksDB', 1);
    // con await realizar la promise para obtener los resultados
    const db = await dbPromise;
    //Iniciar la trasaccion leer y escribir
    let tx = db.transaction('Tasks', 'readwrite');
    //Abrir el store task para inicar la transaccion
    let store = tx.objectStore('Tasks');
    //Recorrer con un foreach los elementos de la data de la promise
    data.forEach(element => {
        //almacenar los valores del objeto en una variable
        let task = {
            name: element.title,
            done: element.completed
        }
        //insertarlos en el store correspondiente todos
        store.add(task);
    });
    //cerrrar la transaccion
    tx.complete;
    //pintar la tabla
    printTable();
}

/*
Recorre toda la Base de datos y la pinta en pantalla.
*/
async function printTable() {
    //abrir la base datos IndexDB con el metodo de IDB.js
    let dbPromise = idb.open('TasksDB', 1);
    //promise para conectar con la base datos asincronamente
    let db = await dbPromise;
    //iniciar la transaccion
    let tx = db.transaction('Tasks', 'readonly');
    let store = tx.objectStore('Tasks');
    let index = store.index('id');
     //promise para recoger todos los valores de la BBDD
    let data = await index.getAll();
    // coger por Id el elemento que se va manipular en el DOM
    var tabla = document.getElementById("contenedortabla");
    //comenzar a pintar la tabla
    var tr = "<table class='w3-bordered w3-table' id='tabla'>";
    tr += "<tr><th>Tareas</th><th>Acciones</th></tr>";
    //recorrer en un forEach los valores que se han traido en la promise de la BBDD
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
    //Inyectar en la variable tabla el resultado de la variable tr con el HTML
    tabla.innerHTML = tr;

}

// Inserta una tarea nueva y repinta la pantalla
async function insertTask(newtask) {
    //abrir la base datos IndexDB con el metodo de IDB.js
    let dbPromise = idb.open('TasksDB', 1);
    //promise para conectar con la base datos asincronamente
    const db = await dbPromise;
    //iniciar la transaccion
    let tx = db.transaction('Tasks', 'readwrite');
    //abrir el store que queremos insertar tarea
    let store = tx.objectStore('Tasks');
    //variable local para almacenar tarea y done
    let task = {
        name: newtask,
        done: false
    }
    //promise para actualizar  asincronamente
    await store.add(task);
     //cerrar la conexion a la base datos
    tx.complete;
     //volver a pintar la tabla
    printTable();
}

// Borra una tarea y repinta la tabla en pantalla
async function deleteTask(index) {
    //abrir la base datos IndexDB con el metodo de IDB.js
    let dbPromise = idb.open('TasksDB', 1);
    //promise para conectar con la base datos asincronamente
    let db = await dbPromise;
    //iniciar la transaccion
    let tx = db.transaction('Tasks', 'readwrite');
    let store = tx.objectStore('Tasks');
    //promise para borrar asincronamente, usar parseInt para meter un entero
    await store.delete(parseInt(index));
    //cerrar la conexion a la base datos
    tx.complete;
    //volver a pintar la tabla
    printTable();
}

// Busca y recupera la tarea a Editar y lo lleva al formulario, se invoca 1º para editar antes de actualizar
async function getTask(domElem) {
    //capturar el elemento del dom quitando lo que sobra y dejando el indice solo
    let id = domElem.substr(5);
    //abrir la base datos IndexDB con el metodo de IDB.js
    let dbPromise = idb.open('TasksDB', 1);
    //promise para conectar con la base datos asincronamente
    let db = await dbPromise;
    //iniciar la transaccion
    let tx = db.transaction('Tasks', 'readwrite');
    let store = tx.objectStore('Tasks');
    //promise para coger la tarea y llevarlo al formulario, usar parseInt para meter un entero
    let task = await store.get(parseInt(id));
    //metemos el id que estamos actualizando para capturarlo despues en el otro evento en el main.js
    document.getElementById("idTask").value = id;
    //Recogemos el valor de la caja texto
    document.getElementById("txtTask").value = task.name;
    //Cambiamos via DOM el nombre del boton
    document.getElementById("btnTask").firstChild.data = "Editar";
    //Ponemos el foco en el texto
    document.getElementById("txtTask").focus();
    //Añadimos un boton de cancelar 
    document.getElementById("btnCancelar").classList.remove("w3-hide");
    
}


//Actualizamos la nueva tarea en la BBDD, se invoca para actualizar
async function updateTask(id,newtask){
    //abrir la base datos IndexDB con el metodo de IDB.js
    let dbPromise = idb.open('TasksDB', 1);
    //promise para conectar con la base datos asincronamente
    let db = await dbPromise;
    //iniciar la transaccion
    let tx = db.transaction('Tasks', 'readwrite');
    let store = tx.objectStore('Tasks');
    //promise para recoger el valor a actualizar
    let task = await store.get(parseInt(id));
    //cambiamos el valor de la tarea a actualizar
    task.name=newtask;
    //promise con await para actualizar en la base datos
    await store.put(task);
    //cerrar la conexion a la base datos
    tx.complete;
    //volver a pintar la tabla
    printTable();
    //Cambiamos el boton a añadir
    document.getElementById("btnTask").firstChild.data = "Añadir";
    //borramos el campo de texto
    document.getElementById("txtTask").value ="";
    //ponemos el foco en el foco
    document.getElementById("txtTask").focus();
    //eliminamos el boton cancelar
    document.getElementById("btnCancelar").classList.add("w3-hide");
}




//exportamos las funciones que queremos usar en el main.js
export default {
    DBInit: DBInit,
    printTable: printTable,
    deleteTask: deleteTask,
    insertTask: insertTask,
    getTask: getTask,
    updateTask: updateTask
 

};