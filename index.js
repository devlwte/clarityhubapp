// Electron JS
const { app, BrowserWindow, dialog } = require('electron');

// Modules de Node
const path = require("path");
const fs = require("fs");
const { URLSearchParams, URL } = require('url');

// Saved
const saved = require('../../modules/saved')

// UtilCode
const utilcode = require("../../modules/utilcodes")

// libraries
const lib = require("../../modules/util-libraries")

// UserData
const userdata = app.getPath("userData")

// package app
const package_app = require("./package.json")


// Crear carpetas
async function setFolders(raiz, ruta) {
    try {
        await utilcode.createFolderRecursive(raiz, ruta);
        return true;
    } catch (error) {
        return false;
    }
}

// Creator Folder App
async function folders_app() {
    await setFolders(userdata, `apps/${package_app.name}/json`);
}

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

// Config Default
async function app_default() {
    // Crear Carpetas
    await folders_app();

    // Crear File config
    await openFileJson(path.join(userdata, "apps", package_app.name, "json", "userdata.json"), true, {
        anchors: []
    });

    // Crear File ventanas
    await openFileJson(path.join(__dirname, "bin", "public", "wins.json"), true, {});
}


const sendAll = (data) => {
    let all_win = BrowserWindow.getAllWindows();
    for (const win of all_win) {
        win.webContents.send('install-app', data);
    }
}


// Remove Objecto
function removeObjecto(arrays, key, value) {
    return arrays.filter((elemento) => elemento[key] !== value);
}


let routes = [
    {
        method: "get",
        path: "/",
        handler: async (req, res) => {

            // User Default
            await app_default();
            // Renderer
            res.render(path.join(__dirname, "bin", "views", "home"), {
                app_pack: package_app
            });
        },
    },
    {
        method: "post",
        path: "/apps_installed",
        handler: (req, res) => {
            let apps = saved.getSaved("all-apps");
            let installed = saved.getSaved("file-db").installed;
            res.json({ apps, installed });
        },
    },
    {
        method: "get",
        path: "/download_repo",
        handler: async (req, res) => {
            res.render(path.join(__dirname, "bin", "views", "downloads"));
        },
    },
    {
        method: "post",
        path: "/repo_download",
        handler: async (req, res) => {
            let body = req.body;
            // verificar si se esta descargando
            if (!saved.hasKey(`repo_${body.name}`)) {

                saved.addSaved(`repo_${body.name}`, {
                    download: 50,
                    message: "running"
                });

                let get = saved.where("all-apps", { ref: body.ref })
                sendAll(get);
                res.send("run_download");

            } else {
                res.send("exist_download");
            }
        }
    },
    {
        method: "post",
        path: "/repo",
        handler: async (req, res) => {

            let { name, remove = false, ...arg } = req.body;

            if (remove) {
                saved.removeSaved(`repo_${name}`)
            } else {
                if (saved.hasKey(`repo_${name}`)) {
                    saved.updateValue(`repo_${name}`, { ...arg });
                }
            }


            res.end();
        }
    },
    {
        method: "post",
        path: "/getinforepo",
        handler: async (req, res) => {
            let body = req.body;
            if (saved.hasKey(`repo_${body.name}`)) {
                res.send(saved.getSaved(`repo_${body.name}`));
            } else {
                res.send({})
            }
        }
    },
    {
        method: "post",
        path: "/updatejson",
        handler: async (req, res) => {
            // identificador
            const { ref, name, dev, version } = req.body;
            
            // db file
            let { installed, ...arg } = await openFileJson(path.join(userdata, "data", "json", "db.json"), true, { installed: [] });

            // eliminar objecto si existe
            let nuevos = removeObjecto(installed, "ref", ref);
            installed = nuevos;

            // nuevo
            installed.push({
                ref,
                name,
                dev,
                version
            });

            if (saved.hasKey("file-db")) {
                saved.removeSaved("file-db");
            }

            saved.addSaved("file-db", { installed, ...arg });

            // Save new data
            await utilcode.fsWrite(path.join(userdata, "data", "json", "db.json"), JSON.stringify({ ...arg, installed }, null, 2));

            res.end();
        }
    },
    {
        method: "post",
        path: "/removejson",
        handler: async (req, res) => {
            // identificador
            const { ref } = req.body;
            
            // db file
            let { installed, ...arg } = await openFileJson(path.join(userdata, "data", "json", "db.json"), true, { installed: [] });

            // eliminar objecto si existe
            let nuevos = removeObjecto(installed, "ref", ref);
            installed = nuevos;


            if (saved.hasKey("file-db")) {
                saved.removeSaved("file-db");
            }

            saved.addSaved("file-db", { installed, ...arg });

            // Save new data
            await utilcode.fsWrite(path.join(userdata, "data", "json", "db.json"), JSON.stringify({ ...arg, installed }, null, 2));

            res.end();
        }
    }

];
module.exports = [...lib, ...routes];