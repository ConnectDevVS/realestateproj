const mongoose = require("mongoose");

const { createBaseSchema } = require("./base.model");
const tenantPlugin = require("../plugins/tenant.plugin");
const hideSecureFieldsPlugin = require("../plugins/hidesecurefields.plugin");
const { status, projectStatus: projectStatus } = require("../utilities/roles");
const CONSTANTS = require("../utilities/constants");

const StageSchema = createBaseSchema(
    {
        pid: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
        title: { type: String, required: true },
        start_date: { type: Date, default: null },
        end_date: { type: Date, default: null },
        estimate: { type: Number, default: 0 },
        total_cost: { type: Number, default: 0 },
        invoice_gen: { type: Number, default: 0 },
        expense: { type: Number, default: 0 },
        members: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "User",
            required: false,
        },

        progress: { type: Number, default: 0, min: 0, max: 100 },
        s_status: {
            type: String,
            enum: [
                projectStatus.ONGOING,
                projectStatus.ONHOLD,
                projectStatus.COMPLETED,
                projectStatus.ABANDONED,
            ],
            default: projectStatus.ONGOING,
        },
        status: {
            type: String,
            enum: [status.ACTIVE, status.INACTIVE],
            default: status.ACTIVE,
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Hide secure fields
StageSchema.plugin(hideSecureFieldsPlugin, {
    fields: ["tenantId", "__v", "createdAt", "updatedAt"],
});

// Add tenant enforcement plugin
StageSchema.plugin(tenantPlugin);

// Post-save hook to update team members when stage members are changed
StageSchema.post("save", async function (doc) {
    try {
        if (this.isModified("members") || (this.isNew && this.members && this.members.length > 0)) {
            const TeamModel = require("./team.model");

            // Find the team associated with this stage's project
            const team = await TeamModel.findOne({
                pid: this.pid,
                tenantId: this.tenantId,
            });

            if (team) {
                // Add members from stage to team if not already present
                let updated = false;
                const newMembers = [...team.members];

                for (const memberId of this.members) {
                    const memberExists = team.members.some(
                        (member) => member.toString() === memberId.toString()
                    );

                    if (!memberExists) {
                        newMembers.push(memberId);
                        updated = true;
                    }
                }

                // Update team members if new members were added
                if (updated) {
                    await TeamModel.findByIdAndUpdate(
                        team._id,
                        { members: newMembers },
                        { new: true, runValidators: true }
                    );
                }
            }
        }
    } catch (error) {
        console.error("Error updating team members from stage:", error);
        // Don't throw the error to avoid blocking the stage save
    }
});

// Post-findOneAndUpdate hook to handle updates via findOneAndUpdate
StageSchema.post("findOneAndUpdate", async function (doc) {
    try {
        if (doc && (this.getOptions().new || doc._id)) {
            const TeamModel = require("./team.model");
            const stageId = this.getFilter()._id;

            // Get the updated stage document
            const updatedStage = await mongoose.model("Stage").findById(stageId);

            if (updatedStage) {
                // Find the team associated with this stage's project
                const team = await TeamModel.findOne({
                    pid: updatedStage.pid,
                    tenantId: updatedStage.tenantId,
                });

                if (team) {
                    // Add members from stage to team if not already present
                    let updated = false;
                    const newMembers = [...team.members];

                    for (const memberId of updatedStage.members) {
                        const memberExists = team.members.some(
                            (member) => member.toString() === memberId.toString()
                        );

                        if (!memberExists) {
                            newMembers.push(memberId);
                            updated = true;
                        }
                    }

                    // Update team members if new members were added
                    if (updated) {
                        await TeamModel.findByIdAndUpdate(
                            team._id,
                            { members: newMembers },
                            { new: true, runValidators: true }
                        );
                    }
                }
            }
        }
    } catch (error) {
        console.error("Error updating team members from stage in findOneAndUpdate:", error);
        // Don't throw the error to avoid blocking the stage update
    }
});

const StageModel = mongoose.model("Stage", StageSchema);
module.exports = StageModel;
