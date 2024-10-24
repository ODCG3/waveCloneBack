var express = require('express');
var router = express.Router();
const instance = require('../utils/ResponseFormatter');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// Example endpoint
router.get('/example', (req, res) => {
  const data = { id: 1, name: 'Example' };
  const message = 'Data retrieved successfully';
  const status = 200;
  const links = [{ rel: 'self', href: '/example' }];

  // Send the formatted response
  res.status(status).json(instance.formatResponse(data, message, status, links));
});

// Export the router
module.exports = router;
