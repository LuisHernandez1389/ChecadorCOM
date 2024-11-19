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

const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('input-excel');
const fileList = document.getElementById('fileList');

dropzone.addEventListener('click', () => {
    fileInput.click();
});

dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
});

dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
});

dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    const files = e.dataTransfer.files;
    handleFiles(files);
});

// Modificación aquí: Maneja los archivos arrastrados
fileInput.addEventListener('change', (e) => {
    const files = e.target.files;
    handleFiles(files);
});

function handleFiles(files) {
    fileList.innerHTML = '';
    for (const file of files) {
        const listItem = document.createElement('div');
        listItem.className = 'alert alert-secondary';
        listItem.textContent = file.name;
        fileList.appendChild(listItem);

        // Llama a handleFile para procesar el archivo
        handleFile({ target: { files: [file] } });
    }
}