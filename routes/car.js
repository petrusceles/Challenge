const express = require('express');
const router = express.Router();
const car = require('../controllers/car');
const upload = require("../middlewares/fileUpload");
router.post('/',upload.single("picture"), car.create);
router.get('/',car.read);
router.get('/:id', car.readById);
router.put('/:id',upload.single("picture"),car.update);
router.delete('/:id', car.readById);
// router.put('/reset_password', )
module.exports = router