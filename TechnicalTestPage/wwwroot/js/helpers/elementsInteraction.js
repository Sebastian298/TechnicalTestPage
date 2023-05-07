﻿

const validateInputText = (inputsId = []) => {
    inputsId.forEach(item => {
        const input = document.getElementById(item);
        input.addEventListener('input', () => {
            const specialChars = /[`0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
            input.value = specialChars.test(input.value) ? '' : input.value;
        });
    })
}

const validateNegativeValuesFromInput = (inputsId = []) => {
    inputsId.forEach(item => {
        const input = document.getElementById(item);
        input.addEventListener('input', () => {
            input.value = input.value < 0 ? 0 : input.value;
        });
    })
}

const showMessageToUser = (config = {}) => {
    Swal.fire({
        icon: config.type,
        title: config.title,
        text: config.message
    });
}

const structJsonForDatatable = (request = {}) => {
    return new Promise((resolve, reject) => {
        try {
            if (!request.json) {
                reject(Error(`json is null`));
            }
            const headersTable = Object.keys(request.json[0]).map(item => ({ data: item, title: item }));
            if (request.hasEditButton) {
                headersTable.push({ data: 'Editar', title: 'Editar' });
                headersTable.push({ data: 'Eliminar', title: 'Eliminar' });
            }
            const datatableStruct = {
                data: request.json,
                columns: headersTable,
                language: {
                    "info": "Mostrando _START_ a _END_ de _TOTAL_ registros",
                    "processing": "Procesando...",
                    "lengthMenu": "Mostrar _MENU_ registros",
                    "zeroRecords": "No se encontraron resultados",
                    "emptyTable": "Ning�n dato disponible en esta tabla",
                    "infoEmpty": "Mostrando registros del 0 al 0 de un total de 0 registros",
                    "infoFiltered": "(filtrado de un total de _MAX_ registros)",
                    "search": "Buscar:",
                    "infoThousands": ",",
                    "loadingRecords": "Cargando...",
                    "paginate": {
                        "first": "Primero",
                        "last": "�ltimo",
                        "next": "Siguiente",
                        "previous": "Anterior"
                    }
                },
                exportOptions: { modifier: 'applied' },
                paging: true,
                ordering: true,
                scrollY: 500,
                scrollCollapse: true,
                scrollX: true,
                deferRender: true,
                dom: 'Bfrtip',
                buttons: [{
                    extend: 'excel',
                    title: request.titleExcel,
                    exportOptions: {
                        columns: ':not(.no-export)'
                    }
                }],
                columnDefs: request.columnDefs,
                initComplete: request.initComplete,
                headerCallback: (thead) => {
                    $(thead).find('th').css('text-align', 'center');
                },
            }
            request.div.classList.remove('table-loader');
            resolve(datatableStruct);
        } catch (e) {
            reject(Error(`Exception in struct json datatable: ${e}`));
        }
    })
}

export {
    validateInputText,
    validateNegativeValuesFromInput,
    showMessageToUser,
    structJsonForDatatable
}