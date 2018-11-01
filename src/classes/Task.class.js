import idb from 'idb';


class Task {

    constructor(name = "") {
        this._databasename = "TasksDB";
        this._dbPromise = "";
        this._version = 1;
        this._name = name;
        this._done = false;
        this.init()
    }

    init() {
        this._dbPromise = idb.open(this._databasename, this._version, function (upgradeDb) {
            if (!upgradeDb.objectStoreNames.contains('Tasks')) {
                console.log('Creando una nueva object store (tabla)...');
                var tasksObjStore = upgradeDb.createObjectStore('Tasks', { keyPath: 'id', autoIncrement: true });
                tasksObjStore.createIndex('id', 'id', { unique: true });
            }
        });
    }

    get dbPromise() {
        return this._dbPromise;
    }

    get name() {
        return this._name;
    }

    get done() {
        return this._done;
    }

    set name(name) {
        this._name = name;
    }

    set done(done) {
        this._done = done;
    }

    /*
    Inserta una nueva tarea
    Devuelve una Promise sin resolver
    Ejemplo de uso:
        Task.insert({name:"Probando"}).then( 
            console.log("Registro ingresado");
        );
    */

    static insert(newtask) {
        return new Task().dbPromise.then(db => {
            var tx = db.transaction('Tasks', 'readwrite');
            var store = tx.objectStore('Tasks');
            var task = {
                name: newtask.name,
                done: false,
                createdAt: new Date().getTime()
            };
            store.add(task);
            return tx.complete;
        });
    }

    /*
    Devuelve un registro con ID =
    Devuelve una Promise sin resolver
    Ejemplo de uso:
        Task.getByID(1).then( val => {
            console.log(val);
        });
    */
    static getByID(id) {
        return new Task().dbPromise.then(db => {
            var tx = db.transaction('Tasks', 'readonly');
            var store = tx.objectStore('Tasks');
            return store.get(id);
        });
    }

    /*
    Devuelve todos los registros de la tabla
    Devuelve una Promise sin resolver
    Ejemplo de uso:
        Task.getAll().then( val => {
            console.log(val);
        });
    */
    static getAll() {
        return new Task().dbPromise.then(db => {
            return db.transaction('Tasks', 'readonly')
                .objectStore('Tasks').getAll();
        });
    }

    /*
    Borra una tarea por su ID 
    Devuelve una Promise sin resolver
    Ejemplo de uso:
        Task.delete(4).then(
            console.log("Regustro borrado")
        );
    */

    static delete(id) {
        return new Task().dbPromise.then(db => {
            var tx = db.transaction('Tasks', 'readwrite');
            var store = tx.objectStore('Tasks');
            store.delete(id);
            return tx.complete;
        });
    }

    static update(id, newtask) {
        //Recuperamos registro
        Task.getByID(id).then(val => {
            return val;
        }).then(val => {
            return new Task().dbPromise.then(db => {
            var tx = db.transaction('Tasks', 'readwrite');
            var store = tx.objectStore('Tasks');
            var item={
                name : newtask.name,
                done : newtask.done,
                createdAt: val.createdAt,
                modifiedAt: new Date().getTime(),
                id: val.id
            };
            store.put(item);
           return tx.complete;
        })
        });


    }
}

export default Task;