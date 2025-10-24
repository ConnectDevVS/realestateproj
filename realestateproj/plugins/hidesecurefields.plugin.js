function hideSecureFieldsPlugin(schema, options = {}) {
    const fieldsToHide = options.fields || ["password", "__v", "refreshToken"];

    schema.set("toJSON", {
        virtuals: true,
        transform(doc, ret) {
            fieldsToHide.forEach((field) => delete ret[field]);
            return ret;
        },
    });

    schema.set("toObject", {
        virtuals: true,
        transform(doc, ret) {
            fieldsToHide.forEach((field) => delete ret[field]);
            return ret;
        },
    });
}

module.exports = hideSecureFieldsPlugin;
