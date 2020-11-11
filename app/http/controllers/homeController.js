
const Product = require('../../models/product')
function homeController() {
  return {
    async index(req, res) {
        const things = await Product.find()
      
    	return res.render('home', { things:things})
    }
  }
}

module.exports = homeController