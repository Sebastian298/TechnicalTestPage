import { fetchRequestAsync } from '../../helpers/restapicaller.js'
import { showMessageToUser, validateInputText, structJsonForDatatable } from '../../helpers/elementsinteraction.js';

const globalSettings = {
    isDatatableClear: false,
    datatableDiv: document.getElementById('tableData'),
    table: null,
    inputNameEdit: document.getElementById('inputNameEdit'),
    inputEmailEdit: document.getElementById('inputEmailEdit'),
    candidateId: 0
};

document.addEventListener('DOMContentLoaded', () => {
    validateInputText(['inputName', 'inputNameEdit']);
    getProspects(true);
});

btnRegister.addEventListener('click', async () => {
    try {
        const name = (document.getElementById('inputName').value || null);
        const email = (document.getElementById('inputEmail').value || null);
        if (name === null || email === null) {
            showMessageToUser({ type: 'info', title: '', message: 'Ambos campos son obligatorios' });
            document.getElementById('inputName').focus();
            return;
        }

        const objRequest = {
            url: 'https://technicaltestapi.azurewebsites.net/interview/prospects',
            method: 'POST',
            doesItRequireAuthToken: false,
            authToken: null,
            antiForgeryToken: null,
            parameters: {
                name: name,
                email: email
            }
        };
        document.getElementById('btnRegister').disabled = true;
        const response = await fetchRequestAsync(objRequest);
        if (response.statusCode === 201) {
            const { type, title, message } = response.content;
            showMessageToUser({ type: type, title: title, message: message });
            document.getElementById('inputName').value = '';
            document.getElementById('inputEmail').value = '';
            getProspects();
        } else if (response.statusCode === 400) {
            const { type, title, message, exceptionMessage } = response.content;
            showMessageToUser({ type: type, title: title, message: message });
            console.error(exceptionMessage);
        } else {
            showMessageToUser({ type: 'error', title: 'Error!', message: 'Error inesperado, intente de nuevo o contacte a soporte' });
            console.error(response);
        }
        document.getElementById('btnRegister').disabled = false;
    } catch (e) {
        showMessageToUser({ type: 'danger', title: 'Error!', message: 'Error inesperado, intente de nuevo o contacte a soporte' });
        console.error(e);
    }
})

btnSaveEdit.addEventListener('click', () => {
    try {
        Swal.fire({
            title: 'Se modificaran los datos del candidato, favor de confirmar',
            showDenyButton: true,
            showCancelButton: false,
            confirmButtonText: 'Confirmar',
            denyButtonText: `Cancelar`,
        }).then(async (result) => {
            if (result.isConfirmed) {
                const name = (document.getElementById('inputNameEdit').value || null);
                const email = (document.getElementById('inputEmailEdit').value|| null);
                if (name === null || email === null) {
                    showMessageToUser({ type: 'info', title: '', message: 'Los campos son obligatorios' });
                    document.getElementById('inputAreaEdit').focus();
                    return;
                }
                const objRequest = {
                    url: `https://technicaltestapi.azurewebsites.net/interview/prospects/${globalSettings.candidateId}`,
                    method: 'PUT',
                    doesItRequireAuthToken: false,
                    authToken: null,
                    antiForgeryToken: null,
                    parameters: {
                        name: name,
                        email: email,
                    }
                };
                const response = await fetchRequestAsync(objRequest);
                if (response.statusCode === 200) {
                    const { type, title, message } = response.content;
                    showMessageToUser({ type: type, title: title, message: message });
                    globalSettings.inputNameEdit.value = '';
                    globalSettings.inputEmailEdit.value = '';
                    $('#updateModal').modal('hide');
                    getProspects();
                } else if (response.statusCode === 400) {
                    const { type, title, message, exceptionMessage } = response.content;
                    showMessageToUser({ type: type, title: title, message: message });
                    $('#updateModal').modal('hide');
                    console.error(exceptionMessage);
                } else {
                    showMessageToUser({ type: 'error', title: 'Error!', message: 'Error inesperado, intente de nuevo o contacte a soporte' });
                    $('#updateModal').modal('hide');
                    console.error(response);
                }
            } else if (result.isDenied) {
                Swal.fire('Los cambios no se guardaron', '', 'info');
            }
        })
    } catch (e) {
        showMessageToUser({ type: 'danger', title: 'Error!', message: 'Error inesperado, intente de nuevo o contacte a soporte' });
        $('#updateModal').modal('hide');
        console.error(e);
    }
})

const getProspects = async (isFirstRequest = false) => {
    try {
        const objRequest = {
            url: 'https://technicaltestapi.azurewebsites.net/interview/prospects',
            method: 'GET',
            doesItRequireAuthToken: false,
            authToken: null,
            antiForgeryToken: null,
            parameters: null
        };
        const response = await fetchRequestAsync(objRequest);
        if (response.statusCode === 200) {
            if (response.content.length > 0) {
                if ((!isFirstRequest) & (!globalSettings.isDatatableClear))
                    $(`#tableData`).DataTable().clear().destroy();
                globalSettings.isDatatableClear = false;
                const requestJson = {
                    json: response.content,
                    hasEditButton: true,
                    titleExcel: 'Candidatos',
                    div: document.getElementById('tableData'),
                    columnDefs: [
                        {
                            target: 0,
                            visible: false,
                            searchable: false,
                        },
                        {
                            targets: '_all',
                            className: 'dt-center',
                        },
                        {
                            targets: 3,
                            data: null,
                            defaultContent: '<a class="btn btn-warning"><i class="fas fa-edit"></i></a>',
                            orderable: false,
                        },
                        {
                            targets: 4,
                            data: null,
                            defaultContent: '<a class="btn btn-danger"><i class="fas fa-trash-alt"></i></a>',
                            orderable: false,
                        },
                        {
                            targets: [0, 3, 4],
                            className: 'dt-center no-export'
                        }
                    ],
                    initComplete: () => {
                        $('#tableData tbody').on('click', 'a.btn.btn-warning', function () {
                            const rowData = globalSettings.table.row($(this).parents('tr')).data();
                            loadDataToModalEdit(rowData);
                        });

                        $('#tableData tbody').on('click', 'a.btn.btn-danger', function () {
                            const rowData = globalSettings.table.row($(this).parents('tr')).data();
                            deleteProspect(rowData.Id);
                        });
                    }
                };
                structJsonForDatatable(requestJson).then(result => {
                    globalSettings.table = $(`#tableData`).DataTable(result);
                    return;
                }).catch(e => {
                    console.error(e);
                });
            } else {
                if (isFirstRequest)
                    globalSettings.isDatatableClear = true;
                if ((!globalSettings.isClearDataTable) & (!isFirstRequest)) {
                    $('#tableData').DataTable().clear().destroy();
                }
            }
        } else {
            showMessageToUser({ type: 'danger', title: 'Error!', message: 'Error inesperado, intente de nuevo o contacte a soporte' });
            console.error(response);
        }
    } catch (e) {
        showMessageToUser({ type: 'danger', title: 'Error!', message: 'Error inesperado, intente de nuevo o contacte a soporte' });
        console.error(e);
    }
}

const deleteProspect = (prospectId = 0) => {
    try {
        Swal.fire({
            title: 'Se eliminara el candidato,favor de confirmar',
            showDenyButton: true,
            showCancelButton: false,
            confirmButtonText: 'Confirmar',
            denyButtonText: `Cancelar`,
        }).then(async (result) => {
            if (result.isConfirmed) {
                const objRequest = {
                    url: `https://technicaltestapi.azurewebsites.net/interview/prospects/${prospectId}`,
                    method: 'DELETE',
                    doesItRequireAuthToken: false,
                    authToken: null,
                    antiForgeryToken: null,
                    parameters: null
                };
                const response = await fetchRequestAsync(objRequest);
                if (response.statusCode === 200) {
                    const { type, title, message } = response.content;
                    showMessageToUser({ type: type, title: title, message: message });
                    globalSettings.datatableDiv.innerHTML = '';
                    globalSettings.datatableDiv.classList.add('table-loader');
                    getProspects();
                } else if (response.statusCode === 400) {
                    const { type, title, message, exceptionMessage } = response.content;
                    showMessageToUser({ type: type, title: title, message: message });
                    console.error(exceptionMessage);
                } else {
                    showMessageToUser({ type: 'error', title: 'Error!', message: 'Error inesperado, intente de nuevo o contacte a soporte' });
                    console.error(response);
                }
            } else if (result.isDenied) {
                Swal.fire('cancelado', '', 'info')
            }
        })
    } catch (e) {
        showMessageToUser({ type: 'danger', title: 'Error!', message: 'Error inesperado, intente de nuevo o contacte a soporte' });
        console.error(e);
    }
}

const loadDataToModalEdit = (obj = {}) => {
    globalSettings.candidateId = obj.Id;
    globalSettings.inputNameEdit.value = obj.Nombre;
    globalSettings.inputEmailEdit.value = obj.Email;
    $('#updateModal').modal('show');
}