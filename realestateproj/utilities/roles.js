const roles = {
    SUPER_ADMIN: "SUPER_ADMIN",
    ADMIN: "ADMIN",
    SUPERVISOR: "SUPERVISOR",
    ACCOUNTS: "ACCOUNTS",
    SUB_CONTRACTOR: "SUB_CONTRACTOR",
    PURCHASE_MANAGER: "PURCHASE_MANAGER",
    CUSTOMER: "CUSTOMER",
};

const status = {
    ACTIVE: "ACTIVE",
    INACTIVE: "INACTIVE",
};
const currency = {
    INR: "INR",
};
const projectStatus = {
    ONGOING: "ONGOING",
    ONHOLD: "ONHOLD",
    COMPLETED: "COMPLETED",
    ABANDONED: "ABANDONED",
};

const scope = {
    USER: "USER",
    PROPERTY: "PROPERTY",
};

module.exports = {
    roles: roles,
    status: status,
    projectStatus: projectStatus,
    currency: currency,
};
