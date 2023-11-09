
function _ajax(url, method, data) {
    return new Promise((resolve, reject) => {
        kit.send({
            url: url,
            method: method,
            data,
            success: (respuesta) => {
                resolve(respuesta);
            },
            error: (codigo, respuesta) => {
                reject({ codigo, respuesta });
            }
        });
    });
}


kit.onDOMReady(async () => {
    let qs = kit.query();

    let elm_title = document.querySelector(".title_des");
    let elm_progress = document.querySelector(".run_download");

    const set = await _ajax("/repo_download", "POST", qs);
    if (set == "run_download") {
        elm_progress.style.width = "50%";
    }


    kit.createInterval("download", async () => {
        const set = await _ajax("/getinforepo", "POST", qs);

        if (set.message == "end") {
            kit.removeInterval("download");
            elm_title.textContent = "Descargado";
            elm_progress.style.width = `${set.download}%`;

            await _ajax("/repo", "POST", {
                name: qs.name,
                remove: true,
            });
            
        } else if (set.message == "error") {
            kit.removeInterval("download");
            elm_title.textContent = "La descarga no fue posible";
            elm_progress.style.width = `0%`;

            await _ajax("/repo", "POST", {
                name: qs.name,
                remove: true,
            });

        }

    }, 2000)

    // M.toast({
    //     html: set,
    //     classes: 'rounded'
    // })
})