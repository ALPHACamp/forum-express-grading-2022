const { Restaurant, User } = require('../models')
// const { localFileHandler } = require('../helpers/file-helpers') // 將 file-helper 載進來
const { imgurFileHandler } = require('../helpers/file-helpers')

const adminController = {
  getRestaurants: (req, res) => {
    return Restaurant.findAll({
      raw: true
    })
      .then(restaurants => {
        return res.render('admin/restaurants', { restaurants: restaurants })
      })
  },
  createRestaurant: (req, res) => {
    return res.render('admin/create-restaurant')
  },
  postRestaurant: (req, res, next) => {
    // 從 req.body 拿出表單裡的資料
    const { name, tel, address, openingHours, description } = req.body
    // name 是必填，若發先是空值就會終止程式碼，並在畫面顯示錯誤提示
    if (!name) throw new Error('Restaurant name is required!')
    const { file } = req // 把檔案取出來，也可以寫成 const file = req.file
    return imgurFileHandler(file) // 把取出的檔案傳給 file-helper 處理後
      .then(filePath =>
        Restaurant.create({ // 產生一個新的 Restaurant 物件實例，並存入資料庫
          name,
          tel,
          address,
          openingHours,
          description,
          image: filePath || null
        }))
      .then(() => {
        req.flash('success_messages', 'restaurant was successfully created') // 在畫面顯示成功提示
        res.redirect('/admin/restaurants') // 新增完成後導回後台首頁
      })
      .catch(err => next(err))
  },
  getRestaurant: (req, res, next) => {
    return Restaurant.findByPk(req.params.id, { // Pk 是 primary key 的簡寫，也就是餐廳的 id，去資料庫用 id 找一筆資料
      raw: true // 找到以後整理格式再回傳
    })
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exist!") //  如果找不到，回傳錯誤訊息，後面不執行
        res.render('admin/restaurant', { restaurant })
      })
      .catch(err => next(err))
  },
  editRestaurant: (req, res, next) => {
    // 先使用 findByPk ，檢查一下有沒有這間餐廳
    return Restaurant.findByPk(req.params.id, {
      raw: true
    })
      .then(restaurant => {
        // 如果沒有的話，直接拋出錯誤訊息。
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        // 有的話，就前往 admin/edit-restaurant
        res.render('admin/edit-restaurant', { restaurant })
      })
      .catch(err => next(err))
  },
  putRestaurant: (req, res, next) => {
    // 將 req.body 中傳入的資料用解構賦值的方法存起來
    const { name, tel, address, openingHours, description } = req.body
    // 檢查必填欄位 name 有資料
    if (!name) throw new Error('Restaurant name is required!')
    const { file } = req // 把檔案取出來
    return Promise.all([ // 非同步處理
    // 透過 Restaurant.findByPk(req.params.id) 把對應的該筆餐廳資料查出來
      Restaurant.findByPk(req.params.id),
      // 編輯情境裡不會加 { raw: true }
      imgurFileHandler(file) // 把檔案傳到 file-helper 處理
    ])
      .then(([restaurant, filePath]) => { // 以上兩樣事都做完以後
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        // 如果有成功查到，就透過 restaurant.update 來更新資料。
        return restaurant.update({
          name,
          tel,
          address,
          openingHours,
          description,
          image: filePath || restaurant.image
          // 如果 filePath 是 Truthy (使用者有上傳新照片) 就用 filePath，是 Falsy (使用者沒有上傳新照片) 就沿用原本資料庫內的值
        })
      })
      .then(() => {
        req.flash('success_messages', 'restaurant was successfully to update')
        res.redirect('/admin/restaurants')
      })
      .catch(err => next(err))
  },
  deleteRestaurant: (req, res, next) => {
    // 先 findByPk ，找找看有沒有這間餐廳。
    return Restaurant.findByPk(req.params.id)
    // 刪除的時候也不會加 { raw: true } 參數
      .then(restaurant => {
        // 沒找到就拋出錯誤並結束
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        // 有就呼叫 sequelize 提供的 destroy() 方法來刪除這筆資料
        return restaurant.destroy()
      })
      // 呼叫完沒問題的話，就回到後台首頁
      .then(() => res.redirect('/admin/restaurants'))
      .catch(err => next(err))
  },
  getUsers: (req, res, next) => {
    return User.findAll({
      raw: true,
      nest: true
    })
      .then(users => res.render('admin/users', { users: users }))
      .catch(err => next(err))
  },
  patchUser: (req, res, next) => {
    return User.findByPk(req.params.id)
      .then(user => {
        if (!user) throw new Error("User didn't exist!")
        if (user.email === 'root@example.com') {
          req.flash('error_messages', '禁止變更 root 權限')
          return res.redirect('back')
        }
        return user.update({ isAdmin: !user.isAdmin })
      })
      .then(() => {
        req.flash('success_messages', '使用者權限變更成功')
        res.redirect('/admin/users')
      })
      .catch(err => next(err))
  }
}
module.exports = adminController
