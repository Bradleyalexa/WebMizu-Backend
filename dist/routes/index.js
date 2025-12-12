"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("./auth"));
const customers_1 = __importDefault(require("./customers"));
const products_1 = __importDefault(require("./products"));
const customerProducts_1 = __importDefault(require("./customerProducts"));
const contracts_1 = __importDefault(require("./contracts"));
const schedules_1 = __importDefault(require("./schedules"));
const technicians_1 = __importDefault(require("./technicians"));
const services_1 = __importDefault(require("./services"));
const orders_1 = __importDefault(require("./orders"));
const invoices_1 = __importDefault(require("./invoices"));
const tasks_1 = __importDefault(require("./tasks"));
const chat_1 = __importDefault(require("./chat"));
const notifications_1 = __importDefault(require("./notifications"));
const reports_1 = __importDefault(require("./reports"));
const router = express_1.default.Router();
// Health check for API
router.get('/health', (req, res) => {
    res.json({
        success: true,
        data: {
            status: 'OK',
            timestamp: new Date().toISOString(),
            api_version: 'v1'
        },
        error: null
    });
});
// API routes
router.use('/auth', auth_1.default);
router.use('/customers', customers_1.default);
router.use('/product-categories', products_1.default);
router.use('/product-catalog', products_1.default);
router.use('/customer-products', customerProducts_1.default);
router.use('/contracts', contracts_1.default);
router.use('/schedules', schedules_1.default);
router.use('/technicians', technicians_1.default);
router.use('/service-logs', services_1.default);
router.use('/orders', orders_1.default);
router.use('/invoices', invoices_1.default);
router.use('/tasks', tasks_1.default);
router.use('/chat', chat_1.default);
router.use('/notifications', notifications_1.default);
router.use('/reporting', reports_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map