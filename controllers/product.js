const Product = require("../models/product.js");

const bcrypt = require("bcrypt");
const auth = require("../auth.js");

const { errorHandler } = auth;

module.exports.createProduct = (req, res) => {
     let newProduct = new Product({
          name: req.body.name,
          description: req.body.description,
          price: req.body.price,
          isActive: req.body.isActive,
          createdOn: req.body.createdOn,
     });

     Product.findOne({ name: req.body.name })
          .then((existingProduct) => {
               if (existingProduct) {
                    return res.send({ message: "Product already on the list" });
               } else {
                    return newProduct
                         .save()
                         .then((result) => {
                              res.status(200).send({
                                   message: "Product successfully added",
                                   product: result,
                              });
                         })
                         .catch((err) => res.status(400).send({ ERROR: "Failed to create product" }));
               }
          })
          .catch((err) => errorHandler(err, req, res));
};

module.exports.getAllProduct = (req, res) => {
     Product.find({})
          .then((result) => {
               if (!result) {
                    return res.status(400).send({ ERROR: "Failled to get all the products" });
               } else {
                    return res.status(200).send(result);
               }
          })
          .catch((err) => errorHandler(err, req, res));
};

module.exports.getAllActiveProduct = (req, res) => {
     Product.find({ isActive: true })
          .then((result) => {
               if (!result) {
                    return res.status(400).send({ ERROR: "No active products found" });
               } else {
                    return res.status(200).send(result);
               }
          })
          .catch((err) => errorHandler(err, req, res));
};

module.exports.getProduct = (req, res) => {
     Product.findById(req.params.productId)
          .then((result) => {
               if (!result) {
                    return res.status(400).send({ ERROR: "No product found" });
               } else {
                    return res.status(200).send(result);
               }
          })
          .catch((err) => errorHandler(err, req, res));
};

module.exports.updateProduct = (req, res) => {
     const { name, description, price, isActive, createdOn } = req.body;

     let updateProduct = {
          name: name,
          description: description,
          price: price,
          isActive: isActive,
          createdOn: createdOn,
     };

     Product.findByIdAndUpdate(req.params.productId, updateProduct, { new: true })
          .then((result) => {
               if (!result) {
                    return res.status(400).send({ ERROR: "Product not updated" });
               } else {
                    return res.status(200).send({
                         message: "Successfully updated the product",
                         productUpdate: result,
                    });
               }
          })
          .catch((err) => errorHandler(err, req, res));
};

module.exports.archiveProduct = (req, res) => {
     let archiveProduct = {
          isActive: false,
     };

     Product.findByIdAndUpdate(req.params.productId, archiveProduct, { new: true })
          .then((product) => {
               if (product) {
                    return res.status(200).send({
                         isActive: false,
                         message: "Successfully archived the product",
                         archivedProduct: product,
                    });
               } else {
                    return res.status(404).send({ ERROR: "Product not found" });
               }
          })
          .catch((err) => errorHandler(err, req, res));
};

module.exports.activateProduct = (req, res) => {
     let archiveProduct = {
          isActive: true,
     };

     Product.findByIdAndUpdate(req.params.productId, archiveProduct, { new: true })
          .then((product) => {
               if (product) {
                    return res.status(200).send({
                         isActive: true,
                         message: "Product successfully activated",
                         archivedProduct: product,
                    });
               } else {
                    return res.status(404).send({ ERROR: "Product not found" });
               }
          })
          .catch((err) => errorHandler(err, req, res));
};

module.exports.searchProduct = (req, res) => {
     Product.findOne({ name: req.body.name })
          .then((result) => {
               if (!result) {
                    return res.status(400).send({ ERROR: "Product not found" });
               } else {
                    return res.status(200).send({
                         message: "Product found",
                         product: result,
                    });
               }
          })
          .catch((err) => errorHandler(err, req, res));
};

module.exports.searchByPrice = async (req, res) => {
     try {
          const { minPrice, maxPrice } = req.body;

          if (!minPrice || !maxPrice || minPrice > maxPrice) {
               return res.status(400).send({ ERROR: "Invalid price range" });
          }

          const courses = await Product.find({ price: { $gte: minPrice, $lte: maxPrice } });

          if (!courses) {
               return res.status(400).send({ ERROR: "No product found" });
          } else {
               return res.status(200).send({
                    message: "Products found",
                    courses,
               });
          }
     } catch (error) {
          console.error("Error searching product by price range:", error);
          res.status(500).send({ message: "Error searching courses by price range." });
     }
};
