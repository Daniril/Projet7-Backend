const express = require('express');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const adaptImg = require('../middleware/sharp-config');

const router = express.Router();

const bookCtrl = require('../controllers/books');

// Gestion requêtes ALL livres
router.get('/', multer, bookCtrl.getAllThings);

// Gestion requêtes bestRatings
router.get('/bestrating', bookCtrl.bestRatings);

// Gestion requêtes UN SEUL livre
router.get('/:id', multer, bookCtrl.getOneThing);

// Gestion requêtes MODIFICATION livre
router.put('/:id', auth, multer, adaptImg, bookCtrl.modifyThing);

// Gestion requêtes SUPPRESSION livre
router.delete('/:id', auth, multer, bookCtrl.deleteThing);

// Gestion requêtes POST
router.post('/', auth, multer, adaptImg, bookCtrl.createThing);

// Gestion requêtes rating
router.post('/:id/rating', auth, bookCtrl.rateThing);


module.exports = router;