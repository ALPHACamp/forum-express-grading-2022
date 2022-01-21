const { Restaurant } = require('../models')
const { localFileHandler } = require('../helpers/file-helpers')

const adminController = {
  getRestaurants: (req, res, next) => {
    return Restaurant.findAll({ raw: true })
      .then(restaurants => res.render('admin/restaurants', { restaurants }))
      .catch(err => next(err))
  },

  createRestaurant: (req, res) => {
    return res.render('admin/create-restaurant.hbs')
  },

  postRestaurant: (req, res, next) => {
    const {
      name, tel, address, openingHours, description
    } = req.body

    if (!name) throw new Error('Restaurant name is required!')
    const { file } = req
    return localFileHandler(file)
      .then(filePath => {
        return Restaurant.create({
          name,
          tel,
          address,
          openingHours,
          description,
          image: filePath || null
        })
      })
      .then(() => {
        req.flash('success_messages', 'Restaurant was successfully created')
        res.redirect('/admin/restaurants')
      })
      .catch(err => next(err))
  },

  getRestaurant: (req, res, next) => {
    const { id } = req.params

    return Restaurant.findByPk(id, { raw: true })
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exists!")

        return res.render('admin/restaurant', { restaurant })
      })
      .catch(err => next(err))
  },

  editRestaurant: (req, res, next) => {
    const { id } = req.params

    return Restaurant.findByPk(id, { raw: true })
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exists!")

        res.render('admin/edit-restaurant', { restaurant })
      })
      .catch(err => next(err))
  },

  putRestaurant: (req, res, next) => {
    const { id } = req.params
    const { name, tel, address, openingHours, description } = req.body
    if (!name) throw new Error('Restaurant name is required!')

    const { file } = req
    return Promise.all([
      Restaurant.findByPk(id), localFileHandler(file)
    ])
      .then(([restaurant, filePath]) => {
        if (!restaurant) throw new Error("Restaurant didn't exists")

        return restaurant.update({
          name,
          tel,
          address,
          openingHours,
          description,
          image: filePath || restaurant.image
        })
      })
      .then(() => {
        req.flash('success_messages', 'Restaurant was successfully updated')
        res.redirect('/admin/restaurants')
      })
      .catch(err => next(err))
  },

  deleteRestaurant: (req, res, next) => {
    const { id } = req.params

    return Restaurant.findByPk(id)
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exists")

        return restaurant.destroy()
      })
      .then(() => {
        req.flash('success_messages', 'Restaurant was successfully deleted')
        res.redirect('/admin/restaurants')
      })
      .catch(err => next(err))
  }
}

module.exports = adminController
