var express = require('express');
var router = express.Router();
const instance = require('../utils/ResponseFormatter');
const Repository = require('../Database/Repository');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// Example endpoint
router.get('/example', async(req, res) => {
  const message = 'Data retrieved successfully';
  const status = 200;
  const links = [{ rel: 'self', href: '/example' }];
  const userData = new Repository("users");
  
  let datas = await userData.getAll();
  
  

  // Send the formatted response
  res.status(status).json(instance.formatResponse(datas, message, status, links));
});

// Export the router
module.exports = router;
