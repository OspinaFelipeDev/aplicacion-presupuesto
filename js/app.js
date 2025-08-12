// ================== Cargar datos desde localStorage restaurando clases ==================
let ingresosGuardados = JSON.parse(localStorage.getItem('ingresos')) || [];
let egresosGuardados = JSON.parse(localStorage.getItem('egresos')) || [];
let monedaSeleccionada = localStorage.getItem('monedaSeleccionada') || "COP";

// Convertir objetos planos en instancias de las clases
let ingresos = ingresosGuardados.map(obj => new Ingreso(obj._descripcion, obj._valor));
let egresos = egresosGuardados.map(obj => new Egreso(obj._descripcion, obj._valor));

// Restaurar contadores estáticos para que no se repitan IDs
if (ingresos.length > 0) {
    Ingreso.contadorIngresos = Math.max(...ingresos.map(i => i.id));
}
if (egresos.length > 0) {
    Egreso.contadorEgresos = Math.max(...egresos.map(e => e.id));
}

// ================== Tasas de cambio ==================
const tasaUSD = 4000; 
const tasaEUR = 4600; 

// ================== Al iniciar la app ==================
let cargarApp = () => {
    document.getElementById("moneda").value = monedaSeleccionada; // restaurar selección
    cargarCabecero();
    cargarIngresos();
    cargarEgresos();
};

// ================== Funciones de cálculo ==================
let totalIngresos = () => ingresos.reduce((total, ingreso) => total + ingreso.valor, 0);
let totalEgresos = () => egresos.reduce((total, egreso) => total + egreso.valor, 0);

// ================== Cargar cabecero ==================
let cargarCabecero = () => {
    let presupuesto = totalIngresos() - totalEgresos();
    let porcentajeEgreso = totalIngresos() ? totalEgresos() / totalIngresos() : 0;
    document.getElementById('presupuesto').innerHTML = formatoMoneda(presupuesto);
    document.getElementById('porcentaje').innerHTML = formatoPorcentaje(porcentajeEgreso);
    document.getElementById('ingresos').innerHTML = formatoMoneda(totalIngresos());
    document.getElementById('egresos').innerHTML = formatoMoneda(totalEgresos());
};

// ================== Cambio de moneda ==================
function cambiarMoneda() {
    monedaSeleccionada = document.getElementById("moneda").value;
    localStorage.setItem("monedaSeleccionada", monedaSeleccionada);
    cargarCabecero();
    cargarIngresos();
    cargarEgresos();
}

// ================== Formato de moneda ==================
const formatoMoneda = (valor) => {
    let locales = { "COP": "es-CO", "USD": "en-US", "EUR": "de-DE" };
    let valorConvertido = valor;

    if (monedaSeleccionada === "EUR") {
        valorConvertido = valor / tasaEUR;
    } else if (monedaSeleccionada === "USD") {
        valorConvertido = valor / tasaUSD;
    }

    return valorConvertido.toLocaleString(locales[monedaSeleccionada], {
        style: 'currency',
        currency: monedaSeleccionada,
        minimumFractionDigits: 2
    });
};

const formatoPorcentaje = (valor) => valor.toLocaleString('en-US', { style: 'percent', minimumFractionDigits: 2 });

// ================== Listar ingresos ==================
const cargarIngresos = () => {
    document.getElementById('lista-ingresos').innerHTML = ingresos.map(crearIngresoHTML).join('');
};

const crearIngresoHTML = (ingreso) => `
    <div class="elemento limpiarEstilos">
        <div class="elemento_descripcion">${ingreso.descripcion}</div>
        <div class="derecha limpiarEstilos">
            <div class="elemento_valor">+ ${formatoMoneda(ingreso.valor)}</div>
            <div class="elemento_eliminar">
                <button class="elemento_eliminar--btn">
                    <ion-icon name="close-circle-outline"
                        onclick='eliminarIngreso(${ingreso.id})'>
                    </ion-icon>
                </button>
            </div>
        </div>
    </div>
`;

const eliminarIngreso = (id) => {
    ingresos = ingresos.filter(ingreso => ingreso.id !== id);
    guardarDatos();
    cargarCabecero();
    cargarIngresos();
};

// ================== Listar egresos ==================
const cargarEgresos = () => {
    document.getElementById('lista-egresos').innerHTML = egresos.map(crearEgresoHTML).join('');
};

const crearEgresoHTML = (egreso) => `
    <div class="elemento limpiarEstilos">
        <div class="elemento_descripcion">${egreso.descripcion}</div>
        <div class="derecha limpiarEstilos">
            <div class="elemento_valor">- ${formatoMoneda(egreso.valor)}</div>
            <div class="elemento_porcentaje">21%</div>
            <div class="elemento_eliminar">
                <button class="elemento_eliminar--btn">
                    <ion-icon name="close-circle-outline"
                        onclick='eliminarEgreso(${egreso.id})'>
                    </ion-icon>
                </button>
            </div>
        </div>
    </div>
`;

const eliminarEgreso = (id) => {
    egresos = egresos.filter(egreso => egreso.id !== id);
    guardarDatos();
    cargarCabecero();
    cargarEgresos();
};

// ================== Agregar ingresos o egresos ==================
let agregarDato = () => {
    let forma = document.forms['forma'];
    let tipo = forma['tipo'].value;
    let descripcion = forma['descripcion'].value;
    let valor = +forma['valor'].value;

    if (descripcion && valor) {
        if (tipo === 'ingreso') {
            ingresos.push(new Ingreso(descripcion, valor));
        } else if (tipo === 'egreso') {
            egresos.push(new Egreso(descripcion, valor));
        }
        guardarDatos();
        cargarCabecero();
        cargarIngresos();
        cargarEgresos();
    }
};

// ================== Guardar datos en localStorage ==================
function guardarDatos() {
    localStorage.setItem('ingresos', JSON.stringify(ingresos));
    localStorage.setItem('egresos', JSON.stringify(egresos));
    localStorage.setItem('monedaSeleccionada', monedaSeleccionada);
}
