// Función para manejar el formato y el log de la fecha seleccionada
function logDate(inputId) {
    const dateValue = document.getElementById(inputId).value;
    if (dateValue) {
        const [year, month, day] = dateValue.split("-");
        const formattedDate = `${day}/${month}/${year}`;
        console.log(`Fecha seleccionada en ${inputId}: ${formattedDate}`);
    } else {
        console.log(`No se seleccionó ninguna fecha en ${inputId}`);
    }
}

// Función para mostrar los registros en una tabla (omitida ID Empleado, ID Registro y Día Inicio)
function renderTable(data) {
    const tableContainer = document.getElementById('tableContainer');
    tableContainer.innerHTML = ''; // Limpiar contenido anterior

    if (data.length === 0) {
        tableContainer.innerHTML = '<p>No se encontraron registros en el rango de fechas.</p>';
        return;
    }

    const table = document.createElement('table');
    table.className = 'table table-striped';

    // Crear el encabezado de la tabla (omitido ID Empleado, ID Registro y Día Inicio)
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Fecha Inicio</th>
            <th>Fecha Fin</th>
            <th>Tiempo Extra</th>
            <th>Tiempo Final</th>
        </tr>
    `;
    table.appendChild(thead);

    // Crear el cuerpo de la tabla
    const tbody = document.createElement('tbody');
    data.forEach(registro => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${registro.fechaInicio}</td>
            <td>${registro.fechaFin}</td>
            <td>${registro.tiempoExtra}</td>
            <td>${registro.tiempoFinal}</td>
        `;
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    // Agregar la tabla al contenedor
    tableContainer.appendChild(table);
}

// Función para buscar registros dentro del rango de fechas seleccionadas
async function fetchRegistrosEnRango() {
    try {
        const date1Value = document.getElementById('dateInput1').value;
        const date2Value = document.getElementById('dateInput2').value;
        const selectedEmployeeId = document.getElementById('employeeSelect').value;

        if (!date1Value || !date2Value) {
            console.error('Por favor selecciona ambas fechas.');
            return;
        }

        if (!selectedEmployeeId) {
            console.error('Por favor selecciona un empleado.');
            return;
        }

        const date1 = new Date(date1Value);
        const date2 = new Date(date2Value);
        const startDate = date1 < date2 ? date1 : date2;
        const endDate = date1 > date2 ? date1 : date2;

        const response = await fetch('https://checador-movil-carquin-default-rtdb.firebaseio.com/empleados.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        const registrosEnRango = [];
        if (data[selectedEmployeeId] && data[selectedEmployeeId].registros) {
            for (const registroId in data[selectedEmployeeId].registros) {
                const registro = data[selectedEmployeeId].registros[registroId];
                const fechaInicioString = registro.fechaInicio.split(',')[0].trim();
                const [day, month, year] = fechaInicioString.split('/');
                const fechaInicio = new Date(`${year}-${month}-${day}`);

                if (fechaInicio >= startDate && fechaInicio <= endDate) {
                    registrosEnRango.push({
                        ...registro // Incluye solo las propiedades del registro, excluyendo ID Empleado y ID Registro
                    });
                }
            }
        }

        // Mostrar los registros en la tabla
        renderTable(registrosEnRango);
    } catch (error) {
        console.error('Error al obtener los registros:', error);
    }
}

// Función para cargar los empleados en el select
async function loadEmployees() {
    try {
        const response = await fetch('https://checador-movil-carquin-default-rtdb.firebaseio.com/empleados.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        const employeeSelect = document.getElementById('employeeSelect');
        for (const employeeId in data) {
            const employee = data[employeeId];
            if (employee.nombre && employee.apellido) {
                const option = document.createElement('option');
                option.value = employeeId;
                option.textContent = `${employee.nombre} ${employee.apellido}`.trim();
                employeeSelect.appendChild(option);
            }
        }
    } catch (error) {
        console.error('Error al cargar los empleados:', error);
    }
}

// Agregar eventos a los inputs para buscar registros cuando se cambian las fechas y se selecciona un empleado
document.getElementById('dateInput1').addEventListener('change', fetchRegistrosEnRango);
document.getElementById('dateInput2').addEventListener('change', fetchRegistrosEnRango);
document.getElementById('employeeSelect').addEventListener('change', fetchRegistrosEnRango);

    // Script para manejar la visibilidad de las secciones
    document.getElementById('showInputBtn').addEventListener('click', function() {
        document.getElementById('inputContainer').classList.remove('d-none');
        document.getElementById('accordionContainer').classList.add('d-none');
    });

    document.getElementById('showAccordionBtn').addEventListener('click', function() {
        document.getElementById('accordionContainer').classList.remove('d-none');
        document.getElementById('inputContainer').classList.add('d-none');
    });

// Cargar la lista de empleados al cargar la página

loadEmployees();


