// UtilCode
const utilcode = require(path.join(__dirname, "../../", "app", "modules/utilcodes"));

// Read Files Json
async function openFileJson(file, existfile = false, value = "") {
    try {
        if (existfile) {
            if (!fs.existsSync(file)) {
                await utilcode.fsWrite(file, JSON.stringify(value, null, 2));
            }
        }
        const filejsontext = await utilcode.fsRead(file)
        return utilcode.jsonParse(filejsontext);
    } catch (error) {
        return false;
    }
}

// Función para enviar mensajes al proceso principal
async function sendMessage(ipc, ...message) {
    try {
        const reply = await ipcRenderer.invoke(ipc, ...message);
        return reply;
    } catch (error) {
        console.error(error);
        return false;
    }
}

// Ajax
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

async function renderItems($artAll, config = {}, callback) {
    const {
        customCSS = {},
    } = config;

    // Verificar si existen elementos
    const $existingItems = $artAll.children();
    if ($existingItems.length > 0) {
        let animationDelay = 0;

        // Animación para reducir el ancho, alto, padding y margin de los elementos existentes
        $existingItems.each(function (index) {
            const $item = $(this);
            $item.animate(customCSS, 500, function () {
                $item.remove();
                if (index === $existingItems.length - 1) {
                    if (callback) {
                        callback();
                    }
                }
            });
            animationDelay += 100;
        });
    } else {
        if (callback) {
            callback();
        }
    }
}

function loadElms(items, $artAll, config = {}, template, nextCallback = false) {
    // show
    kit.show(".page-art-show", 200);
    // add
    const {
        before = {},
        after = {},
    } = config;
    let animationDelay = 0;

    for (const item of items) {
        const newItem = template(item, items.length);
        const $newItem = $(newItem)
            .css({ ...before }) // Aplicar estilos personalizados
            .animate({ ...after }, 500);

        $artAll.append($newItem);
        animationDelay += 100;

        if (nextCallback) {
            nextCallback();
        }
    }
}

function render(data, container, template) {
    container.empty();
    // Css
    const customConfig = {
        customCSS: {
            opacity: 0,
            marginLeft: '-100px',
        },
        before: {
            opacity: 0,
            marginLeft: '-20px',
        },
        after: {
            opacity: 1,
            marginLeft: '0',
        },
    };

    // Cargar Apps Homes
    renderItems(container, customConfig, () => {
        loadElms(data, container, customConfig, template)
    });
}

function cargarElementosEnContenedor({ container, itemWidth = 102, itemHeight = 132, items }, template) {
    container.empty();

    const contenedorWidth = container.width();
    const contenedorHeight = container.height();


    const itemsPerRow = Math.floor(contenedorWidth / itemWidth);
    const itemsPerColumn = Math.floor(contenedorHeight / itemHeight);
    const maxItems = itemsPerRow * itemsPerColumn;


    $('#pagination-home').pagination({
        dataSource: items,
        pageSize: maxItems,
        showPageNumbers: false,
        prevText: "<span class='btn-back icon-keyboard_arrow_left'></span>",
        nextText: "<span class='btn-next icon-keyboard_arrow_right'></span>",
        afterIsLastPage: () => {
            console.log(true);
        },
        callback: async function (data, pagination) {

            if (saved.hasKey("animation")) {
                container.empty();
                for (let i = 0; i < data.length; i++) {
                    const elemento = data[i];
                    container.append(template(elemento));
                }
                saved.removeSaved("animation");
            } else {
                render(data, container, template);
            }


        }
    });

    // for (let i = 0; i < maxItems && i < items.length; i++) {
    //     const elemento = items[i];
    //     container.append(template(elemento));
    // }

}

function loadApps(app_ins) {
    const $contenedor = $('.body-left');
    const items = app_ins.apps;

    const itemWidth = 102;
    const itemHeight = 132;

    let folders = saved.getSaved("folders");

    cargarElementosEnContenedor({ container: $contenedor, itemWidth, itemHeight, items }, (elemento) => {
        const app_is_installed = fs.existsSync(path.resolve(folders.appPath, "apps", elemento.name, "package.json"));

        let { incoFont, isInstalled } = {
            incoFont: app_is_installed ? "icon-check" : "icon-file_download",
            isInstalled: app_is_installed ? true : false,
        }

        return `<div class="item" data-ref="${elemento.ref}" data-name="${elemento.name}" data-title="${elemento.title}" data-cover="${elemento.cover}" data-installed="${isInstalled}" data-type="app">
                    <div class="sub-item z-depth-2" style="background-image: url('${elemento.cover}');">
                    <div class="icono-very ${incoFont}"></div>
                    </div>
                    <div class="name-item">${elemento.title}</div>
                </div>`;
    });
}

kit.onDOMReady(async () => {

    // All folders
    const folders = await sendMessage("all-folders");
    saved.addSaved("folders", folders);
    console.log(folders);

    // get all apps
    let app_ins = await _ajax("/apps_installed", "POST", {});

    loadApps(app_ins);
    $(window).on("resize", function () {
        if (!saved.hasKey("animation")) {
            saved.addSaved("animation", true);
        }
        loadApps(app_ins, false);
    });



    // Agregar un evento para detectar las teclas presionadas
    // document.addEventListener('keydown', function (event) {
    //     // Mostrar en la consola la tecla presionada
    //     console.log('Tecla presionada:', event.key);
    // });

    $(document).registerKeyCombination('Ctrl+Alt+ArrowDown', function (e) {
        if (!saved.hasKey("top_data")) {
            saved.addSaved("top_data", true)

            const $hover = $(".top-data");

            const fun_Interval = () => {
                kit.removeInterval("top_data");
                $hover.animate({ top: "-75px" }, 300);
                kit.removeEvent(document, "click", fun_top);
                saved.removeSaved("top_data");
            };

            const fun_top = (e) => {
                const $topData = document.querySelector(".top-data");

                if ($topData && !$topData.contains(e.target)) {
                    fun_Interval();
                }
            };

            kit.addEvent(document, "click", fun_top);

            $hover.animate({ top: 0 }, 300, () => {

                kit.createInterval("top_data", () => {


                    if (!$hover.is(":hover")) {
                        fun_Interval();
                    }


                }, 5000);
            });
        }
    });

    // Cargar Anclas
    let userdata = await openFileJson(path.join(folders.userData, "apps", "clarityhub_home", "json", "userdata.json"));
    // Css
    const customConfig = {
        customCSS: {
            opacity: 0,
            marginLeft: '-100px',
        },
        before: {
            opacity: 0,
            marginLeft: '-20px',
        },
        after: {
            opacity: 1,
            marginLeft: '0',
        },
    };

    // Cargar Apps Homes
    renderItems($(".anclas"), customConfig, () => {
        loadElms(userdata.anchors, $(".anclas"), customConfig, (item) => {
            return `<div class="ancla-item-body jctx-host jctx-id-foo">
                        <div class="ancla-item tooltipped" style="background-image: url('${item.icono}');" data-position="top" data-tooltip="${item.name}"></div>
                    </div>`
        }, () => {
            M.AutoInit();

        })
    });



    // Scroll Anclas
    const anclasContainer = document.querySelector('.anclas');

    let isScrolling = false;
    let startX = 0;

    anclasContainer.addEventListener('mousedown', (e) => {
        isScrolling = true;
        startX = e.clientX;
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isScrolling) return;

        const scrollLeft = anclasContainer.scrollLeft;
        const movementX = e.clientX - startX;

        anclasContainer.scrollLeft = scrollLeft - movementX;

        startX = e.clientX;
    });

    document.addEventListener('mouseup', () => {
        isScrolling = false;
    });

    winweb.kit = kit;
    winweb.saveState = async (value) => {
        // File wins
        await utilcode.fsWrite(path.join(folders.appPath, "apps", "clarityhub_home", "bin", "public", "wins.json"), JSON.stringify(value, null, 2));

    };
    winweb.loadState = async () => {
        // File wins
        return await openFileJson(path.join(folders.appPath, "apps", "clarityhub_home", "bin", "public", "wins.json"));
    };


})


// reload
ipcRenderer.on("install-app", async (event, data) => {

    sendMessage("new-app", data[0]).then(async (t) => {
        if (t) {
            await _ajax("/repo", "POST", {
                name: data[0].name, download: 100,
                message: "end"
            });

            // editar app view
            const elm = document.querySelector(`[data-ref='${data[0].ref}']`);
            elm.setAttribute("data-installed", "true");
            
            // icono
            let icon_app = elm.querySelector(".sub-item .icono-very");
            if (icon_app.classList.contains("icon-file_download")) {
                icon_app.classList.remove("icon-file_download");
                icon_app.classList.add("icon-check");
            }

            // close ventana
            setTimeout(() => {
                const close_win = document.querySelector(`#win_${data[0].ref}`);
                const btn_close = close_win.querySelector(".close_win_web");
                btn_close.click();
            }, 1000);
            
        } else {
            await _ajax("/repo", "POST", {
                name: data[0].name, download: 0,
                message: "error"
            });
        }

    });


});