module.exports.notLoggedIn = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect("/auth/login");
    }
    next();
}

module.exports.loggedIn = (req, res, next) => {
    if (req.session.isLoggedIn) {
        return res.redirect("/admin");
    }
    next();
}