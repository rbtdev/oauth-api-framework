
//
// We will need to do more here
// 
function serialize(user, cb) {
    cb(null, user);
}

function deserialize(obj, cb) {
    cb(null, obj);
}

module.exports = {
    serialize: serialize,
    deserialize: deserialize
}
