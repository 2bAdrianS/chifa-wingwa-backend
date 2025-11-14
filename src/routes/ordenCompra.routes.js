// src/routes/ordenCompra.routes.js
const router = express.Router();
const ordenCompraController = require('../controllers/ordenCompraController');
const authMiddleware = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.post('/',
    authMiddleware,
    roleCheck(['encargado_almacen']),
    ordenCompraController.createOrdenCompra
);

router.put('/:id/validar',
    authMiddleware,
    roleCheck(['encargado_compras']),
    ordenCompraController.validateOrdenCompra
);

module.exports = router;