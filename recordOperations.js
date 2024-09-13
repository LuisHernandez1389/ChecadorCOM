function splitRecords(name, splitBy) {
    const itemId = `collapse-${name.replaceAll(' ', '-')}`;
    const collapseDiv = document.getElementById(itemId);
    if (collapseDiv) {
        const tableContainer = collapseDiv.querySelector('.table-container');
        if (tableContainer) {
            const tbody = tableContainer.querySelector('tbody');
            if (tbody) {
                // Eliminar divisiones anteriores
                const separatorRows = tbody.querySelectorAll('.separator-row');
                separatorRows.forEach(row => row.remove());

                // Aplicar nueva división
                const rows = Array.from(tbody.querySelectorAll('tr:not(.separator-row)'));
                let currentIndex = 0;
                rows.forEach(row => {
                    if (currentIndex > 0 && currentIndex % splitBy === 0) {
                        const separatorRow = document.createElement('tr');
                        separatorRow.className = 'separator-row';
                        const separatorCell = document.createElement('td');
                        separatorCell.colSpan = row.cells.length;
                        separatorRow.appendChild(separatorCell);
                        row.parentNode.insertBefore(separatorRow, row);
                    }
                    currentIndex++;
                });
            }
        }
    }
}
