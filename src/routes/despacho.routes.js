// src/routes/despacho.routes.js
const router = express.Router();
const despachoController = require('../controllers/despachoController');
const authMiddleware = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.post('/',
    authMiddleware,
    roleCheck(['encargado_almacen']),
    despachoController.createDespacho
);

module.exports = router;