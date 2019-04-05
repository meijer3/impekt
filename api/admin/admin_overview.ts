

// This Typescript is meant for Impekt Viewer 
class overviewTable {

    constructor() {

    }

    databaseRequest(variables): Promise<impekt> {
        let promise = new Promise<any>((resolve, reject) => {
                let url = 'https://u39639p35134.web0087.zxcs-klant.nl/api/'
                let xhr = new XMLHttpRequest();
                xhr.open("POST", url, true);
                xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                xhr.onreadystatechange = () => {
                    if (xhr.readyState == 4) {

                        if (xhr.status == 202) {

                            try {
                                let jsonData = JSON.parse(xhr.responseText);
                                return resolve(jsonData);

                            } catch (e) {
                                return reject(xhr.responseText);
                            }

                        }
                        else if (xhr.status == 400) { // Known Errors in API
                            return reject(JSON.parse(xhr.responseText))
                        }
                        else if (xhr.status == 200) {
                            console.error(xhr.responseText)
                            return reject('Internal Error')
                        }
                        else if (xhr.status == 0) {
                            return reject('Highlikely SSL error');
                        }

                        else {
                            console.error(xhr)
                            return reject('Wrong header: ' + xhr.status)
                        }

                    }
                    // Never reach 
                    else {
                        if (xhr.status == 0) { // API Down... :(
                            return reject('Service down, status 0')
                        }

                    }
                }
                xhr.send('x=getData');
        });

        return promise;

    };
}




window.onload = () => {

   
};
