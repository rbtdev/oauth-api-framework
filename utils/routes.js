let routes = [];
function register(resource, router) {
    router.stack.forEach(layer => {
        if (layer.route) {
            Object.keys(layer.route.methods).forEach(method => {
                routes.push({
                    resource: resource,
                    method: method,
                    path: layer.route.path
                });
            })
        }
    })
}

function list(root) {
    routes.forEach(route => {
        console.log(route.method.toUpperCase().padEnd(7, ' ') + root + route.resource + route.path);
    })
}
module.exports = {
    register: register,
    list: list
}