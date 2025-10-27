const roles = {
    SUPER_ADMIN: "SUPER_ADMIN",
    ADMIN: "ADMIN",
    SUPERVISOR: "SUPERVISOR",
    ACCOUNTS: "ACCOUNTS",
    SUB_CONTRACTOR: "SUB_CONTRACTOR",
    PURCHASE_MANAGER: "PURCHASE_MANAGER",
    CUSTOMER: "CUSTOMER",
};

const userStatus = {
    ACTIVE: "ACTIVE",
    INACTIVE: "INACTIVE",
};

const scope = {
    USER: "USER",
    PROPERTY: "PROPERTY",
};

module.exports = {
    roles: roles,
    userStatus: userStatus,
};
