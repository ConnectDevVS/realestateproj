function tenantMiddleware(req, res, next) {
    const tenantId = req.header("x-tenant-id");
    if (!tenantId) {
        return res.status(400).json({ error: "Missing tenantId in request header" });
    }
    req.tenantId = tenantId;
    next();
}

module.exports = tenantMiddleware;
