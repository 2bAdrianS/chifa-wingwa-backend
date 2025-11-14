// src/routes/insumo.routes.js
const router = express.Router();
const insumoController = require('../controllers/insumoController');
const authMiddleware = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.get('/', authMiddleware, insumoController.getAllInsumos);

router.put('/:id/stock',
    authMiddleware,
    roleCheck(['encargado_almacen', 'jefe_almacen']),
    insumoController.updateStock
);

module.exports = router;