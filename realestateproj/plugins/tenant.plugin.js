function tenantPlugin(schema) {
    const tenantAwareOps = [/^find/, /^update/, /^delete/, /^remove/, /^count/, /^aggregate/];

    tenantAwareOps.forEach((regex) => {
        schema.pre(regex, function (next) {
            const tenantIdFromQuery = this.getQuery?.().tenantId;
            const tenantIdFromOptions = this.options?.tenantId;

            // Handle aggregate pipelines
            if (this.pipeline) {
                const hasTenantMatch = this.pipeline().some(
                    (stage) => stage.$match && stage.$match.tenantId
                );
                if (!hasTenantMatch && tenantIdFromOptions) {
                    this.pipeline().unshift({ $match: { tenantId: tenantIdFromOptions } });
                }
            } else if (!tenantIdFromQuery && tenantIdFromOptions) {
                this.where({ tenantId: tenantIdFromOptions });
            }

            next();
        });
    });
}

module.exports = tenantPlugin;
