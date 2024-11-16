function clearPreviousCalculations(name) {
    const itemId = `collapse-${name.replaceAll(' ', '-')}`;
    const collapseDiv = document.getElementById(itemId);
    if (collapseDiv) {
        const tableContainer = collapseDiv.querySelector('.table-container');
        if (tableContainer) {
            const tbody = tableContainer.querySelector('tbody');
            if (tbody) {
                const totalHoursCells = tbody.querySelectorAll('.total-hours');
                totalHoursCells.forEach(cell => cell.remove());

                // Reactivar el arrastre si se borran los cálculos previos
                tbody.classList.remove('no-drag');
            }
        }
    }
}

function calculateHoursForPair(name, splitBy) {
    const itemId = `collapse-${name.replaceAll(' ', '-')}`;
    const collapseDiv = document.getElementById(itemId);
    if (collapseDiv) {
        const tableContainer = collapseDiv.querySelector('.table-container');
        if (tableContainer) {
            const tbody = tableContainer.querySelector('tbody');
            if (tbody) {
                const rows = Array.from(tbody.querySelectorAll('tr:not(.separator-row)'));
                let currentIndex = 0;

                while (currentIndex < rows.length) {
                    let pairDuration = moment.duration(); // Initialize pair duration

                    for (let i = 0; i < splitBy; i += 2) {
                        if (currentIndex + i + 1 < rows.length) {
                            const startTimeInput12hr = rows[currentIndex + i].querySelector('td:nth-child(6)').textContent.trim();
                            const endTimeInput12hr = rows[currentIndex + i + 1].querySelector('td:nth-child(6)').textContent.trim();

                            // Convertir a formato de 24 horas
                            const startTimeInput = moment(startTimeInput12hr, 'hh:mm:ss a').format('HH:mm:ss');
                            const endTimeInput = moment(endTimeInput12hr, 'hh:mm:ss a').format('HH:mm:ss');

                            const startTime = moment(startTimeInput, 'HH:mm:ss');
                            const endTime = moment(endTimeInput, 'HH:mm:ss');

                            if (endTime.isBefore(startTime)) {
                                endTime.add(1, 'day'); // Adjust for overnight shifts
                            }

                            pairDuration.add(moment.duration(endTime.diff(startTime)));
                        }
                    }

                    // Mostrar la duración del par actual en la última celda correspondiente
                    if (currentIndex + splitBy - 1 < rows.length) {
                        const totalHoursElement = rows[currentIndex + splitBy - 1].querySelector('.total-hours');
                        if (totalHoursElement) {
                            totalHoursElement.textContent = formatDuration(pairDuration);
                        } else {
                            const tdTotalHours = document.createElement('td');
                            tdTotalHours.className = 'total-hours';
                            tdTotalHours.textContent = formatDuration(pairDuration);
                            rows[currentIndex + splitBy - 1].appendChild(tdTotalHours);
                        }
                    }

                    currentIndex += splitBy;
                }

                // Desactivar el arrastre después del cálculo
                tbody.classList.add('no-drag');
            }
        }
    }
}

function formatDuration(duration) {
    const hours = Math.floor(duration.asHours());
    const minutes = Math.floor(duration.asMinutes()) % 60;
    return `${hours} horas y ${minutes} minutos`;
}

function calculateHours(startTimeInput, endTimeInput) {
    const startTime = moment(startTimeInput, 'HH:mm:ss');
    const endTime = moment(endTimeInput, 'HH:mm:ss');

    if (!startTime.isValid() || !endTime.isValid()) {
        return 'Horas inválidas';
    }

    if (endTime.isBefore(startTime)) {
        endTime.add(1, 'day');
    }

    const duration = moment.duration(endTime.diff(startTime));
    const hours = Math.floor(duration.asHours());
    const minutes = Math.floor(duration.asMinutes()) % 60;

    return `${hours} horas y ${minutes} minutos`;
}
