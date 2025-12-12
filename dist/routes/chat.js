"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
// Placeholder routes - to be implemented
router.get('/', (req, res) => {
    res.json({ success: true, data: { message: 'Chat endpoint - coming soon' }, error: null });
});
exports.default = router;
//# sourceMappingURL=chat.js.map