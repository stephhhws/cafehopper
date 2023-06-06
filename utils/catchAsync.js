module.exports = func => { // func is the function we passed in
    return (req, res, next) => { // return a new function that execute func
        func(req, res, next).catch(next); // any error would passed into next 
    }
}