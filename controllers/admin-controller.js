const { Restaurant, User } = require('../models') // 新增這裡 採用解構賦值
const { imgurFileHandler } = require('../helpers/file-helper')

const adminController = { // 修改這裡

  getRestaurants: (req, res, next) => {
    Restaurant.findAll({ raw: true })
      .then(restaurants => res.render('admin/restaurants', { restaurants }))
      .catch(err => next(err))
  },
  createRestaurant: (req, res) => {
    res.render('admin/create-restaurant')
  },
  postRestaurant: (req, res, next) => {
    const { name, tel, address, openingHours, description } = req.body
    if (!name) throw new Error('Restaurant name is required')
    const { file } = req
    imgurFileHandler(file) // 在file-helper已經協助判斷是否有file傳入
      .then(filePath => Restaurant.create({
        name,
        tel,
        address,
        openingHours,
        description,
        image: filePath || null
      })
      )

      .then(() => {
        req.flash('success_messages', 'Restaurant was successfully created')
        res.redirect('/admin/restaurants')
      })
      .catch(err => next(err))
  },
  getRestaurant: (req, res, next) => {
    const id = req.params.id
    Restaurant.findByPk(id, { raw: true })
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exist")
        res.render('admin/restaurant', { restaurant })
      })
      .catch(err => next(err))
  },
  editRestaurant: (req, res, next) => {
    Restaurant.findByPk(req.params.id, { raw: true })
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exist")
        res.render('admin/edit-restaurant', { restaurant })
      })
      .catch(err => next(err))
  },
  putRestaurant: (req, res, next) => {
    const { name, tel, address, openingHours, description } = req.body
    if (!name) throw new Error('Restaurant is required')

    const { file } = req
    Promise.all([
      Restaurant.findByPk(req.params.id), // 這裡不加{ raw: true }
      imgurFileHandler(file)
    ])
      .then(([restaurant, filePath]) => {
        if (!restaurant) throw new Error("Restaurant didn't exist")
        return restaurant.update({ // 因為才可以直接操作資料庫
          name,
          tel,
          address,
          openingHours,
          description,
          image: filePath || restaurant.image
        })
      })
      .then(() => {
        req.flash('success_messages', 'restaurant was successfully to update')
        res.redirect('/admin/restaurants')
      })
      .catch(err => next(err))
  },
  deleteRestaurant: (req, res, next) => {
    Restaurant.findByPk(req.params.id)
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exist")
        return restaurant.destroy()
      })
      .then(() => {
        res.redirect('/admin/restaurants')
      })
      .catch(err => next(err))
  },
  getUsers: (req, res, next) => {
    return User.findAll({ raw: true })
      .then(users => res.render('admin/users', { users }))
      .catch(err => next(err))
  },
  patchUser: async (req, res, next) => {
    try {
      const id = req.params.id
      const user = await User.findByPk(id)
      if (!user) throw new Error('Restaurant is required')
      if (user.email === 'root@example.com') {
        req.flash('error_messages', '禁止變更 root 權限')
        return res.redirect('back')
      }
      await user.update({
        isAdmin: !user.isAdmin
      })
      req.flash('success_messages', '使用者權限變更成功')
      return res.redirect('/admin/users')
    } catch (error) {
      console.log(error)
    }
  }

  // patchUser: (req, res, next) => {
  //   const id = req.params.id
  //   return User.findByPk(id)
  //     .then(user => {
  //       if (!user) {
  //         throw new Error('Restaurant is required')
  //       }
  //       if (user.email === 'root@example.com') {
  //         req.flash('error_messages', '禁止變更 root 權限')
  //         return res.redirect('/admin/users')
  //       }
  //       return user
  //     })
  //     .then(user => { return user.update({ isAdmin: !user.isAdmin }) })
  //     .then(() => {
  //       req.flash('success_messages', '使用者權限變更成功')
  //       return res.redirect('/admin/users')
  //     })
  //     .catch(error => {
  //       console.log(error)
  //       next(error)
  //     })
  // }

}
module.exports = adminController
