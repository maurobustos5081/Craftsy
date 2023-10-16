const {validationResult} = require('express-validator');
const {existsSync, unlinkSync} = require('fs')
const db = require('../../database/models');

module.exports = (req, res) => {
    
    const errors = validationResult(req);

    if(errors.isEmpty()){
      
      const {name, price, discount, description, brand, section} = req.body

      db.Product.create({
        name : name.trim(),
        price,
        discount : discount || 0,
        description : description.trim(),
        brandId : brand,
        sectionId : section,
        image : req.files.image ? req.files.image[0].filename : null
      })
        .then(product => {

          if(req.files.images){
            const images = req.files.images.map((file) => {
                return {
                  file : file.filename,
                  main : false,
                  productId : product.id,
                }
            })

            db.Image.bulkCreate(images, {
              validate : true
            }).then(response => {
              return res.redirect('/admin');
            })
          }else{
            return res.redirect('/admin');

          }
        })
        .catch(error => console.log(error))
     

    }else {

      if(req.files.length){
        req.files.forEach(file => {
          existsSync('./public/images/' + file.filename) && unlinkSync('./public/images/' + file.filename)
        });
      }

      const brands = db.Brand.findAll({
        order : ['name']
      });
  
      const sections = db.Section.findAll({
        order : ['name']
      });
  
      Promise.all([brands, sections])
        .then(([brands, sections]) => {
          return res.render("productAdd", {
            brands,
            sections,
            errors : errors.mapped(),
            old : req.body
          });
        })
        .catch(error => console.log(error))
    }


  
  }