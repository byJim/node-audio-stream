const {Router} = require('express');
const router = Router();

const {getTracks, uploadTracks} = require('../controllers/tracks.controller');

router.get('/tracks/:trackID', getTracks);

router.post('/tracks', uploadTracks);

module.exports = router;
