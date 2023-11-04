let routes = [
    {
        method: "get",
        path: "/",
        handler: (req, res) => {
            res.send("Welcome to the myApp Home page!");
        },
    },
    {
        method: "get",
        path: "/about",
        handler: (req, res) => {
            res.send("Welcome to the About page");
        },
    },

];
module.exports = routes;