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
    UNVERIFIED: "UNVERIFIED",
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

const paymentStatus = {
    SUCCESS: "SUCCESS",
    FAILED: "FAILED",
    INPROGRESS: "INPROGRESS",
};

const requestStatus = {
    ONHOLD: "ONHOLD",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED",
    RECEIVED: "RECEIVED",
};

const paymentMode = {
    ONLINE: "ONLINE",
    CASH: "CASH",
    CHEQUE: "CHEQUE",
    DD: "DD",
    OTHERS: "OTHERS",
};

const transactionType = {
    ADVANCE: "ADVANCE",
    REGULAR: "REGULAR",
    ADDITIONAL: "ADDITIONAL",
};

const quantityMetric = {
    BAGS: "BAGS",
    PACKS: "PACKS",
    COUNT: "COUNT",
    LITRE: "LITRE",
    MILLILITRE: "MILLILITRE",
    KILOGRAM: "KILOGRAM",
    GRAM: "GRAM",
};

const complaintStatus = {
    OPEN: "OPEN",
    CLOSED: "CLOSED",
};

const fileTypes = {
    IMAGE: "IMAGE",
    CONSTRUCTION_FILES: "CONSTRUCTION_FILE",
    CONTRACT_FILES: "CONTRACT_FILE",
    PROFILE_ICON: "PROFILE_ICON",
    PROJECT_ICON: "PROJECT_ICON",
};

module.exports = {
    roles: roles,
    status: status,
    projectStatus: projectStatus,
    currency: currency,
    paymentStatus: paymentStatus,
    requestStatus: requestStatus,
    paymentMode: paymentMode,
    transactionType: transactionType,
    quantityMetric: quantityMetric,
    complaintStatus: complaintStatus,
    fileTypes: fileTypes,
};
