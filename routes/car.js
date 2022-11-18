const express = require('express');
const router = express.Router();
const car = require('../controllers/car');
const upload = require("../middlewares/fileUpload");
const fileEncoder = require("../middlewares/fileEncoder")
router.post('/',upload.single("picture"),fileEncoder.fileEncoder, car.create);
router.get('/',car.read);
router.get('/:id', car.readById);
router.put('/:id',upload.single("picture"),fileEncoder.fileEncoder,car.update);
router.delete('/:id', car.remove);
// router.put('/reset_password', )
module.exports = router