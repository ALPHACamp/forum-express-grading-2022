const { Restaurant } = require('../models')

const adminController = {
  getRestaurants: (req, res, next) => {
    Restaurant.findAll({
      raw: true
    })
      .then(restaurants => res.render('admin/restaurants', { restaurants }))
      .catch(err => next(err))
  },
  createRestaurant: (req, res) => {
    res.render('admin/create-restaurant')
  },
  postRestaurant: (req, res, next) => {
    const { name, tel, address, openingHours, description } = req.body
    if (!name) throw new Error('Restaurant name is required!')
    Restaurant.create({
      name,
      tel,
      address,
      openingHours,
      description
    })
      .then(() => {
        req.flash('success_messages', 'The restaurant is created successfully!')
        res.redirect('/admin/restaurants')
      })
      .catch(err => next(err))
  },
  getRestaurant: (req, res, next) => {
    Restaurant.findByPk(req.params.id, {
      raw: true
    })
      .then(restaurant => {
        if (!restaurant) throw new Error('The restaurant does not exist!')
        res.render('admin/restaurant', { restaurant })
      })
      .catch(err => next(err))
  },
  editRestaurant: (req, res, next) => {
    Restaurant.findByPk(req.params.id, {
      raw: true
    })
      .then(restaurant => {
        if (!restaurant) throw new Error('The restaurant does not exist!')
        res.render('admin/edit-restaurant', { restaurant })
      })
      .catch(err => next(err))
  },
  putRestaurant: (req, res, next) => {
    const { name, tel, address, openingHours, description } = req.body
    if (!name) throw new Error('Restaurant name is required!')
    Restaurant.findByPk(req.params.id)
      .then(restaurant => {
        return restaurant.update({
          name,
          tel,
          address,
          openingHours,
          description
        })
      })
      .then(() => {
        req.flash('success_messages', 'The restaurant is updated successfully!')
        res.redirect('/admin/restaurants')
      })
      .catch(err => next(err))
  },
  deleteRestaurant: (req, res, next) => {
    Restaurant.findByPk(req.params.id)
      .then(restaurant => {
        if (!restaurant) throw new Error('The restaurant does not exist!')
        return restaurant.destroy()
      })
      .then(() => {
        res.redirect('/admin/restaurants')
      })
      .catch(err => next(err))
  }
}

module.exports = adminController
