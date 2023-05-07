import { fetchRequestAsync } from '../../helpers/restapicaller.js'
import { showMessageToUser, validateInputText, validateNegativeValuesFromInput, structJsonForDatatable } from '../../helpers/elementsinteraction.js';

const globalSettings = {
    isDatatableClear: false,
    datatableDiv: document.getElementById('tableData'),
    table: null,
    inputAreaEdit: document.getElementById('inputAreaEdit'),
    inputSalaryEdit: document.getElementById('inputSalaryEdit'),
    selectActiveEdit: document.getElementById('selectActiveEdit'),
    vacancyId:0
};
document.addEventListener('DOMContentLoaded', () => {
    validateInputText(['inputArea','inputAreaEdit']);
    validateNegativeValuesFromInput(['inputSalary','inputSalaryEdit']);
    getVacancies(true);
});

btnRegister.addEventListener('click', async () => {
    try {
        const area = (document.getElementById('inputArea').value || null);
        const salary = (parseFloat(document.getElementById('inputSalary').value) || null);
        if (area === null || salary === null) {
            showMessageToUser({ type: 'info', title: '', message: 'Ambos campos son obligatorios' });
            document.getElementById('inputArea').focus();
            return;
        }

        const objRequest = {
            url: 'https://technicaltestapi.azurewebsites.net/interview/vacancies',
            method: 'POST',
            doesItRequireAuthToken: false,
            authToken: null,
            antiForgeryToken: null,
            parameters: {
                area: area,
                salary: salary
            }
        };
        document.getElementById('btnRegister').disabled = true;
        const response = await fetchRequestAsync(objRequest);
        if (response.statusCode === 201) {
            const { type, title, message } = response.content;
            showMessageToUser({ type: type, title: title, message: message });
            document.getElementById('inputArea').value = '';
            document.getElementById('inputSalary').value = '';
            getVacancies();
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
            title: 'Se modificaran los datos de la vacante, favor de confirmar',
            showDenyButton: true,
            showCancelButton: false,
            confirmButtonText: 'Confirmar',
            denyButtonText: `Cancelar`,
        }).then(async (result) => {
            if (result.isConfirmed) {
                const area = (document.getElementById('inputAreaEdit').value || null);
                const salary = (parseFloat(document.getElementById('inputSalaryEdit').value) || null);
                const active = globalSettings.selectActiveEdit.value.toLowerCase() === "true";
                if (area === null || salary === null) {
                    showMessageToUser({ type: 'info', title: '', message: 'Los campos son obligatorios' });
                    document.getElementById('inputAreaEdit').focus();
                    return;
                }
                const objRequest = {
                    url: `https://technicaltestapi.azurewebsites.net/interview/vacancies/${globalSettings.vacancyId}`,
                    method: 'PUT',
                    doesItRequireAuthToken: false,
                    authToken: null,
                    antiForgeryToken: null,
                    parameters: {
                        area: area,
                        salary: salary,
                        active: active
                    }
                };
                const response = await fetchRequestAsync(objRequest);
                if (response.statusCode===200) {
                    const { type, title, message } = response.content;
                    showMessageToUser({ type: type, title: title, message: message });
                    globalSettings.inputAreaEdit.value = '';
                    globalSettings.inputSalaryEdit.value = '';
                    $('#updateModal').modal('hide');
                    getVacancies();
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

const getVacancies = async (isFirstRequest=false) => {
    try {
        const objRequest = {
            url: 'https://technicaltestapi.azurewebsites.net/interview/vacancies',
            method: 'GET',
            doesItRequireAuthToken: false,
            authToken: null,
            antiForgeryToken: null,
            parameters: null
        };
        const response = await fetchRequestAsync(objRequest);
        if (response.statusCode === 200) {
            if (response.content.length>0) {
                if ((!isFirstRequest) & (!globalSettings.isDatatableClear))
                    $(`#tableData`).DataTable().clear().destroy();
                globalSettings.isDatatableClear = false;
                const requestJson = {
                    json: response.content,
                    hasEditButton: true,
                    titleExcel: 'Vacantes',
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
                            targets: 4,
                            data: null,
                            defaultContent: '<a class="btn btn-warning"><i class="fas fa-edit"></i></a>',
                            orderable: false,
                        },
                        {
                            targets: 5,
                            data: null,
                            defaultContent: '<a class="btn btn-danger"><i class="fas fa-trash-alt"></i></a>',
                            orderable: false,
                        },
                        {
                            targets: [0,4,5],
                            className: 'dt-center no-export'
                        },
                        {
                            targets: 2,
                            render: $.fn.dataTable.render.number(',', '.', 2,)
                        }
                    ],
                    initComplete: () => {
                        $('#tableData tbody').on('click', 'a.btn.btn-warning', function () {
                            const rowData = globalSettings.table.row($(this).parents('tr')).data();
                            loadDataToModalEdit(rowData);
                        });

                        $('#tableData tbody').on('click', 'a.btn.btn-danger', function () {
                            const rowData = globalSettings.table.row($(this).parents('tr')).data();
                            deleteVacancy(rowData.Id);
                        });
                    }
                };
                structJsonForDatatable(requestJson).then(result => {
                    globalSettings.table= $(`#tableData`).DataTable(result);
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
        }else {
            showMessageToUser({ type: 'danger', title: 'Error!', message: 'Error inesperado, intente de nuevo o contacte a soporte' });
            console.error(response);
        }
    } catch (e) {
        showMessageToUser({ type: 'danger', title: 'Error!', message: 'Error inesperado, intente de nuevo o contacte a soporte' });
        console.error(e);
    }
}

const loadDataToModalEdit = (obj = {}) => {
    globalSettings.vacancyId = obj.Id;
    globalSettings.inputAreaEdit.value = obj.Area;
    globalSettings.inputSalaryEdit.value = obj.Salario;
    globalSettings.selectActiveEdit.value = obj.Activo;
    $('#updateModal').modal('show');
}

const deleteVacancy = (vacancyId=0) => {
    try {
        Swal.fire({
            title: 'Se eliminara la vacante,favor de confirmar',
            showDenyButton: true,
            showCancelButton: false,
            confirmButtonText: 'Confirmar',
            denyButtonText: `Cancelar`,
        }).then(async (result) => {
            if (result.isConfirmed) { 
                const objRequest = {
                    url: `https://technicaltestapi.azurewebsites.net/interview/vacancies/${vacancyId}`,
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
                    getVacancies();
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