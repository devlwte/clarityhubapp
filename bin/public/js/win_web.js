class WinWeb {
    constructor() {
        this.kit = null;
        this.saveState = null;
        this.loadState = null;
        this.wins = {};
    }

    async windows(id = "win_default", {
        title = false,
        width = 500,
        height = 200,
        classes = false,
        url,
        iconClose,
        icon = "/lib/apps/iconos/clarityhub_home.svg"
    }) {

        let ventanaWin = document.createElement("div");
        ventanaWin.style.opacity = 0;
        ventanaWin.style.width = width + "px";
        ventanaWin.style.height = height + "px";
        ventanaWin.setAttribute("id", id);


        if (classes) {
            for (const cls of classes) {
                ventanaWin.classList.add(cls);
            }
        }

        // Barra
        let barra = document.createElement("div");
        barra.classList.add("barra-top");
        barra.style.display = "flex";
        barra.style.alignItems = "center";
        barra.style.flexWrap = "nowrap";
        barra.style.justifyContent = "space-between";

        // close ventana
        let closeVentana = document.createElement("div");
        closeVentana.classList.add("close_win_web");
        closeVentana.style.display = "flex";
        closeVentana.style.alignItems = "center";
        closeVentana.style.justifyContent = "center";
        closeVentana.innerHTML = iconClose;

        // icono title
        let titleIcon = document.createElement("div");
        titleIcon.classList.add("titleicon");

        // Icono
        let icon_barra = document.createElement("div");
        icon_barra.classList.add("iconbarra");
        icon_barra.style.backgroundImage = `url('${icon}')`;

        // Title
        let title_barra = document.createElement("div");
        title_barra.classList.add("title_win");
        title_barra.textContent = title;

        /**********/
        // icono de la ventana
        titleIcon.append(icon_barra);

        /**********/
        // titulo de la ventana
        titleIcon.append(title_barra);

        /**********/
        // titulo y icono
        barra.append(titleIcon);
        /**********/

        /**********/
        // close vetana
        barra.append(closeVentana);
        /**********/

        ventanaWin.append(barra);
        // end

        // Webview
        const webviewElement = document.createElement("webview");
        webviewElement.src = url;
        webviewElement.classList.add("webview");

        ventanaWin.append(webviewElement);
        // end

        document.body.append(ventanaWin);

        // Load State
        await this.state(id, ventanaWin, "load");

        // Close
        const funClose = (e) => {
            // Save State
            this.state(id, ventanaWin, "save");
            this.kit.hide(ventanaWin, 100, () => {
                // remove EventListener
                closeVentana.removeEventListener("click", funClose);
                ventanaWin.remove();
            })
        };

        closeVentana.addEventListener("click", funClose);

        // show
        this.kit.show(ventanaWin, 100);

        // draggable
        this.draggable(ventanaWin);

    }

    draggable(windowElement) {
        var isDragging = false;
        var offsetX, offsetY;

        var barraTop = windowElement.querySelector('.barra-top');

        barraTop.addEventListener('mousedown', function (e) {
            isDragging = true;
            offsetX = e.clientX - windowElement.getBoundingClientRect().left;
            offsetY = e.clientY - windowElement.getBoundingClientRect().top;
        });

        document.addEventListener('mousemove', function (e) {
            if (isDragging) {
                var left = e.clientX - offsetX;
                var top = e.clientY - offsetY;

                windowElement.style.left = left + 'px';
                windowElement.style.top = top + 'px';
            }
        });

        document.addEventListener('mouseup', function () {
            isDragging = false;
        });
    }

    async state(id, ventana, type) {
        // ventanas
        let ventanas = await this.loadState();

        if (type === "save") {
            let left = ventana.style.left.trim().replace(/\D/g, '');
            let top = ventana.style.top.trim().replace(/\D/g, '');
            let width = ventana.offsetWidth;
            let height = ventana.offsetHeight;

            if (!ventanas[id]) {
                ventanas[id] = {
                    left,
                    top,
                    width,
                    height
                };
            } else {
                ventanas[id].left = left ? left : '0px';
                ventanas[id].top = top ? top : '0px';
                ventanas[id].width = width;
                ventanas[id].height = height;
            }

            await this.saveState(ventanas);
        } else if (type === "load") {
            if (ventanas[id]) {
                const windowWidth = window.innerWidth;
                const windowHeight = window.innerHeight;
                const ventanaWidth = ventana.offsetWidth;
                const ventanaHeight = ventana.offsetHeight;

                // Asegurarse de que las coordenadas no se desborden hacia la derecha ni hacia abajo
                let left = parseInt(ventanas[id].left, 10);
                let top = parseInt(ventanas[id].top, 10);

                // Evitar que las coordenadas se desborden a la derecha
                left = Math.min(left, windowWidth - ventanaWidth);

                // Evitar que las coordenadas se desborden hacia abajo
                top = Math.min(top, windowHeight - ventanaHeight);

                // Asegurarse de que las coordenadas no sean negativas
                left = Math.max(0, left);
                top = Math.max(0, top);

                ventana.style.left = left + 'px';
                ventana.style.top = top + 'px';
                ventana.style.width = ventanas[id].width + 'px';
                ventana.style.height = ventanas[id].height + 'px';
            } else {
                const windowWidth = window.innerWidth;
                const windowHeight = window.innerHeight;
                const ventanaWidth = ventana.offsetWidth;
                const ventanaHeight = ventana.offsetHeight;

                const left = (windowWidth - ventanaWidth) / 2;
                const top = (windowHeight - ventanaHeight) / 2;

                ventana.style.left = left + 'px';
                ventana.style.top = top + 'px';
                ventana.style.width = 500 + 'px';
                ventana.style.height = 200 + 'px';

            }
        }
    }


}

const winweb = new WinWeb();