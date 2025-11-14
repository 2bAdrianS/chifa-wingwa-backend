// src/routes/reporte.routes.js
const router = express.Router();
const reporteController = require('../controllers/reporteController');
const authMiddleware = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/stock',
    authMiddleware,
    roleCheck(['jefe_almacen', 'dueno']),
    reporteController.getStockReport
);

router.get('/historial',
    authMiddleware,
    roleCheck(['jefe_almacen', 'dueno']),
    reporteController.getHistorial
);

module.exports = router;