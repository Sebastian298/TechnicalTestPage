/*

    Definicion de respuesta en la api
    {
                   statusCode: int,
                   content: object or List of object
                   messages: {
                        "type": "string",
                        "title": "string",
                        "message": "string",
                        "innerException": "string"
                   }
    }

    Definicion de parametro en fetchRequestAsync
    {
          url: string,
          method: string [GET/POST/DELETE/PUT],
          doesItRequireAuthToken: bool,
          authToken: string / null,
          antiForgeryToken: string / null,
          parameters: {} / null
    }
*/

const httpMethodTypes = ['POST', 'PUT', 'DELETE'];

const fetchRequestAsync = async (fetchParameters = null) => {
    if (!fetchParameters) {
        return null;
    }

    const { url, method, parameters, doesItRequireAuthToken, authToken } = fetchParameters;
    const requestOptions = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
        mode: 'cors',
    };

    if (doesItRequireAuthToken && authToken) {
        requestOptions.headers.Authorization = `bearer ${authToken}`;
    }

    if (httpMethodTypes.includes(method)) {
        requestOptions.body = JSON.stringify(parameters);
    } else if (parameters) {
        const separator = url.includes('handler') ? '&' : '?';
        url += separator + new URLSearchParams(parameters).toString();
    }

    try {
        const response = await fetch(url, requestOptions);
        const isJson = response.headers.get('content-type')?.includes('application/json');
        const data = isJson ? await response.json() : null;

        if (data) {
            const { statusCode, content, messages } = data;
            let messg, cont;

            if (content?.hasOwnProperty('type') && content?.hasOwnProperty('Success')) {
                messg = content;
                cont = null;
            } else {
                messg = messages;
                cont = content;
            }

            return { success: true, content: cont, messages: messg, statusCode };
        }

        return { success: false, content: null, message: null, statusCode: null };

    } catch (error) {
        console.error('There was an error calling endpoint!!!', error);
        return null;
    }
};

export {
    fetchRequestAsync
}