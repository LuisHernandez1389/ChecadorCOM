document.getElementById('input-excel').addEventListener('change', handleFile, false);

let recordsByName = {};

function handleFile(e) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const json = XLSX.utils.sheet_to_json(worksheet);

        recordsByName = {};
        json.forEach(record => {
            if (record.Nombre) {
                if (!recordsByName[record.Nombre]) {
                    recordsByName[record.Nombre] = [];
                }
                recordsByName[record.Nombre].push(record);
            }
        });

        localStorage.setItem('recordsByName', JSON.stringify(recordsByName));
        renderAccordion();
    };

    reader.readAsArrayBuffer(file);
}

// Cargar datos del localStorage al cargar la página
window.addEventListener('load', function() {
    const savedRecords = localStorage.getItem('recordsByName');
    if (savedRecords) {
        recordsByName = JSON.parse(savedRecords);
        renderAccordion();
    }
});
