// src/models/base.model.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

// Base fields shared across all models
const BaseSchemaFields = {
    tenantId: {
        type: String,
        required: true,
        index: true,
    },
};

// Factory function to create schemas that include tenantId and timestamps
function createBaseSchema(definition) {
    const schema = new Schema(
        {
            ...BaseSchemaFields,
            ...definition,
        },
        {
            id: false,
            timestamps: true,
            toJSON: { virtuals: true },
            toObject: { virtuals: true },
        }
    );

    return schema;
}

module.exports = { createBaseSchema };
