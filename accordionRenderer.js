function resetTable(name) {
    const tbody = document.querySelector(`#collapse-${name.replaceAll(' ', '-')} .table tbody`);
    tbody.innerHTML = ''; // Limpiar todas las filas existentes

    recordsByName[name].forEach(record => {
        const row = document.createElement('tr');
        const checkboxTd = document.createElement('td');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkboxTd.appendChild(checkbox);
        row.appendChild(checkboxTd);

        const keys = Object.keys(record);
        const columnsToExclude = ['Clock-in/out', 'ID Locación', 'Número de ID', 'verifycode', 'CardNo'];

        keys.forEach(key => {
            if (!columnsToExclude.includes(key)) {
                const td = document.createElement('td');
                if (key === 'Fecha/Hora') {
                    td.textContent = record[key] ? record[key].substring(0, 10) : ''; // Mostrar solo la fecha
                } else {
                    td.textContent = record[key];
                }
                row.appendChild(td);
            }
        });

        const tdHora = document.createElement('td');
        const fechaHora = record['Fecha/Hora'];
        tdHora.textContent = fechaHora ? fechaHora.substring(11) : '';
        row.appendChild(tdHora);

        const tdEliminar = document.createElement('td');
        const btnEliminar = document.createElement('button');
        btnEliminar.className = 'btn btn-danger btn-sm';
        btnEliminar.textContent = 'Eliminar';
        btnEliminar.addEventListener('click', function () {
            row.remove();
            clearPreviousCalculations(name);
        });
        tdEliminar.appendChild(btnEliminar);
        row.appendChild(tdEliminar);

        tbody.appendChild(row);
    });

    // Recalcular después de resetear
    clearPreviousCalculations(name);
}
function printTable(name) {
    // Encuentra la tabla dentro del acordeón
    const table = document.querySelector(`#collapse-${name.replaceAll(' ', '-')}` + ' .table');
    if (!table) {
        console.error('No se encontró la tabla para el nombre:', name);
        return;
    }

    // Clona la tabla para modificarla sin afectar el DOM original
    const clonedTable = table.cloneNode(true);

    // Obtiene los valores de horas trabajadas y horas extra
    const totalHoursWorkedElement = document.getElementById(`total-hours-${name.replaceAll(' ', '-')}`);
    const extraHoursElement = document.getElementById(`extra-hours-${name.replaceAll(' ', '-')}`);

    const totalHoursWorkedText = totalHoursWorkedElement ? totalHoursWorkedElement.textContent : 'Total Horas Trabajadas: 0 horas y 0 minutos';
    const extraHoursText = extraHoursElement ? extraHoursElement.textContent : 'Horas Extra: 0 horas y 0 minutos';

    // Crear una nueva ventana para la impresión
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>Imprimir Tabla</title>');
    printWindow.document.write('<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">');
    printWindow.document.write('</head><body>');

    // Agregar la tabla al documento de impresión
    printWindow.document.write(clonedTable.outerHTML);

    // Agregar los totales de horas trabajadas y horas extra
    printWindow.document.write(`<div class="total-container mt-3"><h5>Totales</h5><p>${totalHoursWorkedText}</p><p>${extraHoursText}</p></div>`);

    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
}


function disableSortable(name) {
    const table = document.querySelector(`#collapse-${name.replaceAll(' ', '-')}` + ' .table');
    if (!table) {
        console.error('No se encontró la tabla para el nombre:', name);
        return;
    }

    const tbody = table.querySelector('tbody');
    if (!tbody) {
        console.error('No se encontró el cuerpo de la tabla.');
        return;
    }

    Sortable.get(tbody).destroy(); // Desactiva el sortable en el tbody
}

function printCalculatedHours(name) {
    // Encuentra la tabla dentro del acordeón
    const table = document.querySelector(`#collapse-${name.replaceAll(' ', '-')}` + ' .table');
    if (!table) {
        console.error('No se encontró la tabla para el nombre:', name);
        return;
    }

    // Encuentra el cuerpo de la tabla
    const tbody = table.querySelector('tbody');
    if (!tbody) {
        console.error('No se encontró el cuerpo de la tabla.');
        return;
    }

    // Encuentra todas las filas del cuerpo de la tabla
    const rows = tbody.querySelectorAll('tr');
    let totalMinutes = 0; // Acumulador para los minutos totales

    rows.forEach(row => {
        // Encuentra todas las celdas de la fila
        const cells = row.querySelectorAll('td');
        // Ajusta el índice para seleccionar la última columna
        const calculatedHourCell = cells[cells.length - 1]; // La última columna para las horas calculadas
        if (calculatedHourCell) {
            // Obtén el contenido de la celda y limpia espacios
            const content = calculatedHourCell.textContent.trim();
            if (content && content !== 'Eliminar') {
                // Parsea las horas y minutos
                const match = content.match(/(\d+)\s*horas\s*y\s*(\d+)\s*minutos/);
                if (match) {
                    const hours = parseInt(match[1], 10);
                    const minutes = parseInt(match[2], 10);
                    // Convierte todo a minutos y acumula
                    totalMinutes += (hours * 60) + minutes;
                }
            }
        }
    });

    // Convierte el total de minutos a horas y minutos
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    // Crear contenedor para total y horas extra
    const totalContainer = document.createElement('div');
    totalContainer.className = 'total-container mt-3';
    totalContainer.id = `total-container-${name.replaceAll(' ', '-')}`;

    // Crear campos de entrada y resultados
    totalContainer.innerHTML = `
        <h5>Totales</h5>
        <p id="total-hours-${name.replaceAll(' ', '-')}" >Total Horas Trabajadas: ${totalHours} horas y ${remainingMinutes} minutos</p>
        <label for="required-hours-${name.replaceAll(' ', '-')}" >Horas Requeridas:</label>
        <input type="number" id="required-hours-${name.replaceAll(' ', '-')}" name="required-hours" value="0" min="0">
        <p id="extra-hours-${name.replaceAll(' ', '-')}" >Horas Extra: 0 horas y 0 minutos</p>
    `;

    // Agregar el contenedor debajo de la tabla
    table.parentNode.appendChild(totalContainer);

    // Agregar evento para actualizar horas extra
    document.getElementById(`required-hours-${name.replaceAll(' ', '-')}`).addEventListener('input', function () {
        const requiredHours = parseTime(this.value || '0:00');
        const totalMinutesWorked = totalMinutes;
        const totalHoursWorked = formatTime(totalMinutesWorked);
        const requiredMinutes = requiredHours.totalMinutes;
        const extraMinutes = Math.max(0, totalMinutesWorked - requiredMinutes);
        const extraHours = formatTime(extraMinutes);

        document.getElementById(`total-hours-${name.replaceAll(' ', '-')}`).textContent = `Total Horas Trabajadas: ${totalHoursWorked.hours} horas y ${totalHoursWorked.minutes} minutos`;
        document.getElementById(`extra-hours-${name.replaceAll(' ', '-')}`).textContent = `Horas Extra: ${extraHours.hours} horas y ${extraHours.minutes} minutos`;
    });
}

function parseTime(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return { hours: hours || 0, minutes: minutes || 0, totalMinutes: (hours || 0) * 60 + (minutes || 0) };
}

function formatTime(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return { hours, minutes };
}

function parseTime(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return { hours: hours || 0, minutes: minutes || 0, totalMinutes: (hours || 0) * 60 + (minutes || 0) };
}

function formatTime(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return { hours, minutes };
}

function renderAccordion() {
    const accordion = document.getElementById('accordionExample');
    accordion.innerHTML = ''; // Limpiar contenido anterior

    for (const name in recordsByName) {

        const card = document.createElement('div');
        card.className = 'card';

        const cardHeader = document.createElement('div');
        cardHeader.className = 'card-header d-flex align-items-center';

        // Checkbox para el nombre
        const nameCheckbox = document.createElement('input');
        nameCheckbox.type = 'checkbox';
        nameCheckbox.className = 'mr-2'; // Añadir margen derecho

        const button = document.createElement('button');
        button.className = 'btn btn-link';
        button.type = 'button';
        button.setAttribute('data-toggle', 'collapse');
        button.setAttribute('data-target', `#collapse-${name.replaceAll(' ', '-')}`);
        button.setAttribute('aria-expanded', 'true');
        button.setAttribute('aria-controls', `collapse-${name.replaceAll(' ', '-')}`);
        button.textContent = name;

        // Contenedor para checkbox y nombre
        const headerContent = document.createElement('div');
        headerContent.className = 'd-flex align-items-center';
        headerContent.appendChild(nameCheckbox);
        headerContent.appendChild(button);

        cardHeader.appendChild(headerContent);
        card.appendChild(cardHeader);

        const collapseDiv = document.createElement('div');
        collapseDiv.id = `collapse-${name.replaceAll(' ', '-')}`;
        collapseDiv.className = 'collapse';
        collapseDiv.setAttribute('aria-labelledby', `heading-${name.replaceAll(' ', '-')}`);
        collapseDiv.setAttribute('data-parent', '#accordionExample');

        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';

        const buttonGroup = document.createElement('div');
        buttonGroup.className = 'mb-3';

        const buttonSplitTwo = document.createElement('button');
        buttonSplitTwo.className = 'btn btn-primary mr-2';
        buttonSplitTwo.textContent = 'Dividir cada 2 registros';
        buttonSplitTwo.addEventListener('click', function () {
            clearPreviousCalculations(name);
            splitRecords(name, 2);
            calculateHoursForPair(name, 2);
            disableSortable(name);  // Desactivar arrastre después del cálculo
            printCalculatedHours(name);
        });

        const buttonSplitFour = document.createElement('button');
        buttonSplitFour.className = 'btn btn-secondary';
        buttonSplitFour.textContent = 'Dividir cada 4 registros';
        buttonSplitFour.addEventListener('click', function () {
            clearPreviousCalculations(name);
            splitRecords(name, 4);
            calculateHoursForPair(name, 4);
            disableSortable(name); // Desactivar arrastre después del cálculo
            printCalculatedHours(name);
        });
        const buttonReset = document.createElement('button');
        buttonReset.className = 'btn btn-warning ml-2';
        buttonReset.textContent = 'Reiniciar Tabla';
        buttonReset.addEventListener('click', function () {
            resetTable(name); // Llamar a la función de reinicio de la tabla
        });
        // Botón para imprimir el contenido de la tabla
        const buttonPrint = document.createElement('button');
        buttonPrint.className = 'btn btn-info ml-2';
        buttonPrint.textContent = 'Imprimir';
        buttonPrint.addEventListener('click', function () {
            printTable(name);
        });

        // Crear el botón para calcular horas extra
        const calculateHoursButton = document.createElement('button');
        calculateHoursButton.className = 'btn btn-secondary ml-2'; // Ajusta la clase según tu estilo
        calculateHoursButton.textContent = 'Calcular Horas Extra';
        calculateHoursButton.id = `calculate-hours-${name.replaceAll(' ', '-')}`;

        // Añadir el botón para calcular horas extra al buttonGroup
        buttonGroup.appendChild(calculateHoursButton);

        // Asignar el evento click al botón para calcular horas extra
        calculateHoursButton.addEventListener('click', function () {
            printCalculatedHours(name); // Ejecutar la función para calcular las horas
        });

        buttonGroup.appendChild(buttonSplitTwo);
        buttonGroup.appendChild(buttonSplitFour);
        buttonGroup.appendChild(buttonReset);
        buttonGroup.appendChild(buttonPrint);

        const tableContainer = document.createElement('div');
        tableContainer.className = 'table-container';

        const table = document.createElement('table');
        table.className = 'table table-bordered';

        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        const selectAllTh = document.createElement('th');
        const selectAllCheckbox = document.createElement('input');
        selectAllCheckbox.type = 'checkbox';
        selectAllCheckbox.addEventListener('change', function () {
            const checkboxes = table.querySelectorAll('tbody input[type="checkbox"]');
            checkboxes.forEach(checkbox => checkbox.checked = selectAllCheckbox.checked);
        });
        selectAllTh.appendChild(selectAllCheckbox);
        headerRow.appendChild(selectAllTh);

        const keys = Object.keys(recordsByName[name][0]);
        const columnsToExclude = ['Clock-in/out', 'ID Locación', 'Número de ID', 'verifycode', 'CardNo'];
        keys.forEach(key => {
            if (!columnsToExclude.includes(key)) { // Omitir columnas especificadas
                const th = document.createElement('th');
                th.textContent = key;
                headerRow.appendChild(th);
            }
        });

        // Agregar la nueva columna para la hora
        const thHora = document.createElement('th');
        thHora.textContent = 'Hora';
        headerRow.appendChild(thHora);

        // Agregar una columna para eliminar la fila
        const thEliminar = document.createElement('th');
        thEliminar.textContent = 'Eliminar';
        headerRow.appendChild(thEliminar);

        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        recordsByName[name].forEach(record => {
            const row = document.createElement('tr');
            const checkboxTd = document.createElement('td');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkboxTd.appendChild(checkbox);
            row.appendChild(checkboxTd);

            keys.forEach(key => {
                if (!columnsToExclude.includes(key)) { // Omitir columnas especificadas
                    const td = document.createElement('td');
                    if (key === 'Fecha/Hora') {
                        td.textContent = record[key] ? record[key].substring(0, 10) : ''; // Mostrar solo la fecha
                    } else {
                        td.textContent = record[key];
                    }
                    row.appendChild(td);
                }
            });

            // Agregar el valor de la nueva columna para la hora
            const tdHora = document.createElement('td');
            const fechaHora = record['Fecha/Hora'];
            tdHora.textContent = fechaHora ? fechaHora.substring(11) : '';
            row.appendChild(tdHora);

            // Agregar el botón de eliminar
            const tdEliminar = document.createElement('td');
            const btnEliminar = document.createElement('button');
            btnEliminar.className = 'btn btn-danger btn-sm';
            btnEliminar.textContent = 'Eliminar';
            btnEliminar.addEventListener('click', function () {
                row.remove();
                clearPreviousCalculations(name);
            });
            tdEliminar.appendChild(btnEliminar);
            row.appendChild(tdEliminar);

            tbody.appendChild(row);
        });
        table.appendChild(tbody);

        tableContainer.appendChild(table);

        // Inicializa Sortable.js en el tbody
        const sortable = new Sortable(tbody, {
            handle: 'td', // Permite arrastrar desde cualquier celda
            animation: 150,
            onEnd: function () {
                clearPreviousCalculations(name); // Limpiar cálculos antiguos
                // Comentado para evitar cálculo automático
                // calculateHoursForPair(name, 2); // Recalcular después de mover
            }
        });

        // Formulario para añadir registros
        const addRecordForm = document.createElement('form');
        addRecordForm.className = 'mb-3';

        const formRow = document.createElement('div');
        formRow.className = 'form-row';

        keys.forEach(key => {
            if (!columnsToExclude.includes(key)) {
                const formGroup = document.createElement('div');
                formGroup.className = 'form-group col-md-2';
                const label = document.createElement('label');
                label.textContent = key;
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'form-control';
                input.name = key;
                formGroup.appendChild(label);
                formGroup.appendChild(input);
                formRow.appendChild(formGroup);
            }
        });



        const formGroupButton = document.createElement('div');
        formGroupButton.className = 'form-group col-md-2 align-self-end';
        const addButton = document.createElement('button');
        addButton.type = 'button';
        addButton.className = 'btn btn-primary';
        addButton.textContent = 'Añadir';

        addButton.addEventListener('click', function () {
            const newRecord = {};
            keys.forEach(key => {
                if (!columnsToExclude.includes(key)) {
                    const input = addRecordForm.querySelector(`[name="${key}"]`);
                    if (input) {
                        newRecord[key] = input.value;
                    }
                }
            });

            const inputHora = addRecordForm.querySelector('[name="Hora"]');
            if (inputHora) {
                newRecord['Fecha/Hora'] = `${newRecord['Fecha/Hora']} ${inputHora.value}`;
            }

            // Agregar el nuevo registro a la lista
            recordsByName[name].push(newRecord);

            // Ordenar la lista según la fecha y hora
            recordsByName[name].sort((a, b) => {
                const dateA = a['Fecha/Hora'].match(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2}) (a\. m\.|p\. m\.)/);
                const dateB = b['Fecha/Hora'].match(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2}) (a\. m\.|p\. m\.)/);

                const dayA = parseInt(dateA[1]);
                const monthA = parseInt(dateA[2]);
                const yearA = parseInt(dateA[3]);
                const hourA = parseInt(dateA[4]);
                const minuteA = parseInt(dateA[5]);
                const secondA = parseInt(dateA[6]);
                const ampmA = dateA[7] === 'a. m.' ? 0 : 12;

                const dayB = parseInt(dateB[1]);
                const monthB = parseInt(dateB[2]);
                const yearB = parseInt(dateB[3]);
                const hourB = parseInt(dateB[4]);
                const minuteB = parseInt(dateB[5]);
                const secondB = parseInt(dateB[6]);
                const ampmB = dateB[7] === 'a. m.' ? 0 : 12;

                const timestampA = new Date(yearA, monthA - 1, dayA, hourA + ampmA, minuteA, secondA).getTime();
                const timestampB = new Date(yearB, monthB - 1, dayB, hourB + ampmB, minuteB, secondB).getTime();

                return timestampA - timestampB;
            });

            // Renderizar la tabla de nuevo
            renderTable(name);
            clearPreviousCalculations(name); // Actualizar cálculos
        });

        function renderTable(name) {
            const table = document.querySelector(`#collapse-${name.replaceAll(' ', '-')}` + ' .table');
            if (!table) {
                console.error('No se encontró la tabla para el nombre:', name);
                return;
            }

            const tbody = table.querySelector('tbody');
            if (!tbody) {
                console.error('No se encontró el cuerpo de la tabla.');
                return;
            }

            tbody.innerHTML = ''; // Limpiar el cuerpo de la tabla

            recordsByName[name].forEach((record, index) => {
                const row = document.createElement('tr');
                const checkboxTd = document.createElement('td');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkboxTd.appendChild(checkbox);
                row.appendChild(checkboxTd);

                keys.forEach(key => {
                    if (!columnsToExclude.includes(key)) {
                        const td = document.createElement('td');
                        if (key === 'Fecha/Hora') {
                            const [datePart, timePart] = record[key].split(' ');
                            td.textContent = datePart;
                        } else {
                            td.textContent = record[key];
                        }
                        row.appendChild(td);
                    }
                });

                const tdHora = document.createElement('td');
                const fechaHora = record['Fecha/Hora'];
                tdHora.textContent = fechaHora ? fechaHora.split(' ')[1] : '';
                row.appendChild(tdHora);

                const tdEliminar = document.createElement('td');
                const btnEliminar = document.createElement('button');
                btnEliminar.className = 'btn btn-danger btn-sm';
                btnEliminar.textContent = 'Eliminar';
                btnEliminar.addEventListener('click', function () {
                    recordsByName[name].splice(index, 1);
                    renderTable(name);
                    clearPreviousCalculations(name);
                });
                tdEliminar.appendChild(btnEliminar);
                row.appendChild(tdEliminar);

                tbody.appendChild(row);
            });
        }

        formGroupButton.appendChild(addButton);
        formRow.appendChild(formGroupButton);
        addRecordForm.appendChild(formRow);

        cardBody.appendChild(buttonGroup);
        cardBody.appendChild(addRecordForm);
        cardBody.appendChild(tableContainer);

        collapseDiv.appendChild(cardBody);
        card.appendChild(collapseDiv);
        accordion.appendChild(card);

        // Rellenar el formulario con el primer registro
        if (recordsByName[name].length > 0) {
            const firstRecord = recordsByName[name][0];
            keys.forEach(key => {
                if (!columnsToExclude.includes(key)) {
                    const input = addRecordForm.querySelector(`[name="${key}"]`);
                    if (input && firstRecord[key]) {
                        input.value = firstRecord[key];
                    }
                }
            });

            const inputHora = addRecordForm.querySelector('[name="Hora"]');
            if (inputHora && firstRecord['Fecha/Hora']) {
                inputHora.value = firstRecord['Fecha/Hora'].substring(11);
            }
        }
    }
}
