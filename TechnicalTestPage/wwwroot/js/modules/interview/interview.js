import { fetchRequestAsync } from '../../helpers/restapicaller.js'
import { showMessageToUser, validateInputText, structJsonForDatatable, assignSelect2Format, getCurrentDatetime } from '../../helpers/elementsinteraction.js';

const globalSettings = {
    isDatatableClear: false,
    datatableDiv: document.getElementById('tableData'),
    table: null,
    inputNoteEdit: document.getElementById('inputNotesEdit'),
    selectRecruitedEdit: document.getElementById('selectRecruitedEdit'),
    inputDateEdit: document.getElementById('inputDateInterviewEdit'),
    interviewId: 0
};

document.addEventListener('DOMContentLoaded', () => {
    validateInputText(['inputNotesEdit', 'inputNotes']);
    document.getElementById('inputDateInterview').value = getCurrentDatetime();
    getInterviews(true);
    getVacanciesFromFillSelects();
    getProspectsFromFillSelects();
});

btnRegister.addEventListener('click', async () => {
    try {
        const vacancy = document.getElementById('selectVacancy').value;
        const prospect = document.getElementById('selectProspect').value;
        const notes = document.getElementById('inputNotes').value;
        const interviewDate = document.getElementById('inputDateInterview').value;
        const objRequest = {
            url: 'https://technicaltestapi.azurewebsites.net/interview/interviews',
            method: 'POST',
            doesItRequireAuthToken: false,
            authToken: null,
            antiForgeryToken: null,
            parameters: {
                vacancyId: vacancy,
                prospectId: prospect,
                interviewDate:interviewDate,
                notes:notes
            }
        };
        document.getElementById('btnRegister').disabled = true;
        const response = await fetchRequestAsync(objRequest);
        if (response.statusCode === 201) {
            const { type, title, message } = response.content;
            showMessageToUser({ type: type, title: title, message: message });
            document.getElementById('inputNotes').value = '';
            document.getElementById('inputDateInterview').value = getCurrentDatetime();
            getInterviews();
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
});

btnSaveEdit.addEventListener('click', () => {
    try {
        Swal.fire({
            title: 'Se modificaran los datos de la entrevista, favor de confirmar',
            showDenyButton: true,
            showCancelButton: false,
            confirmButtonText: 'Confirmar',
            denyButtonText: `Cancelar`,
        }).then(async (result) => {
            if (result.isConfirmed) {
                const notes = globalSettings.inputNoteEdit.value;
                const interviewDate = globalSettings.inputDateEdit.value;
                const recruited = globalSettings.selectRecruitedEdit.value.toLowerCase() === "true";;
                const objRequest = {
                    url: `https://technicaltestapi.azurewebsites.net/interview/interviews/${globalSettings.interviewId}`,
                    method: 'PUT',
                    doesItRequireAuthToken: false,
                    authToken: null,
                    antiForgeryToken: null,
                    parameters: {
                        interviewDate: interviewDate,
                        notes: notes,
                        recruited: recruited
                    }
                };
                const response = await fetchRequestAsync(objRequest);
                if (response.statusCode === 200) {
                    const { type, title, message } = response.content;
                    showMessageToUser({ type: type, title: title, message: message });
                    globalSettings.inputNoteEdit.value = '';
                    globalSettings.inputDateEdit.value = getCurrentDatetime();
                    $('#updateModal').modal('hide');
                    getInterviews();
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

const deleteInterview = (interviewId = 0) => {
    try {
        Swal.fire({
            title: 'Se eliminara la entrevista,favor de confirmar',
            showDenyButton: true,
            showCancelButton: false,
            confirmButtonText: 'Confirmar',
            denyButtonText: `Cancelar`,
        }).then(async (result) => {
            if (result.isConfirmed) {
                const objRequest = {
                    url: `https://technicaltestapi.azurewebsites.net/interview/interviews/${interviewId}`,
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
                    getInterviews();
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

const getInterviews = async (isFirstRequest=false) => {
    try {
        const objRequest = {
            url: 'https://technicaltestapi.azurewebsites.net/interview/interviews',
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
                    titleExcel: 'Entrevistas',
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
                            targets: 6,
                            data: null,
                            defaultContent: '<a class="btn btn-warning"><i class="fas fa-edit"></i></a>',
                            orderable: false,
                        },
                        {
                            targets: 7,
                            data: null,
                            defaultContent: '<a class="btn btn-danger"><i class="fas fa-trash-alt"></i></a>',
                            orderable: false,
                        },
                        {
                            targets: [0, 6, 7],
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
                            deleteInterview(rowData.Id);
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

const getVacanciesFromFillSelects = async () => {
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
            const jsonFormat = response.content.map(item => ({
                id: item.Id,
                text: item.Area
            }));
            assignSelect2Format('selectVacancy', jsonFormat);
            assignSelect2Format('selectVacancyEdit', jsonFormat);
        } else {
            assignSelect2Format('selectVacancy');
            assignSelect2Format('selectVacancyEdit');
        }
    } catch (e) {
        console.error(e);
    }
}

const getProspectsFromFillSelects = async () => {
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
            const jsonFormat = response.content.map(item => ({
                id: item.Id,
                text: item.Nombre
            }));
            assignSelect2Format('selectProspect', jsonFormat);
            assignSelect2Format('selectProspectEdit', jsonFormat);
        } else {
            assignSelect2Format('selectProspect');
            assignSelect2Format('selectProspectEdit');
        }
    } catch (e) {
        console.error(e);
    }
}

const loadDataToModalEdit = (obj = {}) => {
    globalSettings.interviewId = obj.Id;
    globalSettings.inputNoteEdit.value = obj.Notas;
    globalSettings.inputDateEdit.value = obj['Fecha Entrevista'];
    globalSettings.selectRecruitedEdit.value = obj.Reclutado;
    $('#updateModal').modal('show');
}