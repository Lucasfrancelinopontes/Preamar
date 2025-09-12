const express = require('express');


const options = {}; 
const router = express.Router(options);

router.get('/municipios', (req, res) => {
    res.json({ message: 'Lista de municípios' });
});

module.exports = router;