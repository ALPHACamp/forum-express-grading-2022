const { Restaurant } = require('../models')
// 上面是解構賦值的寫法，等於下面這種寫法的簡寫
// const db = require('../models')
// const Restaurant = db.Restaurant

const adminController = {
  // 瀏覽全部餐廳頁面
  getRestaurants: (req, res, next) => {
    // 先去資料庫撈全部的餐廳資料
    Restaurant.findAll({
      raw: true // 使用raw: true整理資料，把資料變成單純js的JSON格式物件，如此收到回傳的資料以後，就可以直接把資料放到樣板裡面了
    })
    // 撈完資料，再渲染畫面
      .then(restaurants => res.render('admin/restaurants', { restaurants }))
      .catch(err => next(err))
  },
  // 新增餐廳表單頁面
  createRestaurant: (req, res) => {
    return res.render('admin/create-restaurant') // *******為甚麼這裡要return？
  },
  // 新增餐廳資料給db
  postRestaurant: (req, res, next) => {
    const { name, tel, address, openingHours, description } = req.body

    // 後端驗證，確保必有input name="name"這個資料
    if (!name) throw new Error('Restaurant name is required!')

    Restaurant.create({
      name,
      tel,
      address,
      openingHours,
      description
    })
      .then(() => {
        req.flash('success_messages', 'restaurant was successfully created')
        res.redirect('/admin/restaurants')
      })
      .catch(err => next(err))
  },
  // 瀏覽1間餐廳頁面
  getRestaurant: (req, res, next) => {
    Restaurant.findByPk(req.params.id, // 對應到路由傳過來的參數，用此參數去資料庫用 id 找一筆資料
      {
        raw: true // 找到以後整理格式成單純的js物件再回傳
      })
      .then(restaurant => {
        if (!restaurant) throw new Error('這間餐廳不存在!') //  如果找不到，回傳錯誤訊息，後面不執行
        res.render('admin/restaurant', { restaurant })
      })
      .catch(err => next(err))
  },
  // 編輯1間餐廳表單頁面
  editRestaurant: (req, res, next) => {
    Restaurant.findByPk(req.params.id,
      {
        raw: true
      })
      .then(restaurant => {
        if (!restaurant) throw new Error('這間餐廳不存在!')
        res.render('admin/edit-restaurant', { restaurant })
      })
      .catch(err => next(err))
  },
  putRestaurant: (req, res, next) => {
    const { name, tel, address, openingHours, description } = req.body
    if (!name) throw new Error('Restaurant name is required!')
    // 因為這邊會需要用到 restaurant.update 這個方法，如果加上參數就會把 sequelize 提供的這個方法過濾掉，會無法使用。因此在編輯情境裡我們是不會加 { raw: true } 的。
    Restaurant.findByPk(req.params.id)
      .then(restaurant => {
        if (!restaurant) throw new Error('這間餐廳不存在!')

        // 注意!!這邊加 return 可以把這段return裡的程式碼執行結果直接帶到下個then前面，這樣是為了避免太多巢狀程式碼，使的不好閱讀跟維護，但因為是剛好下個then不會需要用到return內的值才可以這樣寫，如果要的話，還是必須寫成下面的方式，把then接在後面
        // restaurant.update({
        //   name,
        //   tel,
        //   address,
        //   openingHours,
        //   description
        // }).then(() => {})
        return restaurant.update({
          name,
          tel,
          address,
          openingHours,
          description
        })
      })
      .then(() => {
        req.flash('success_messages', 'restaurant was successfully to update')
        res.redirect('/admin/restaurants')
      })
      .catch(err => next(err))
  },
  deleteRestaurant: (req, res, next) => {
    return Restaurant.findByPk(req.params.id) // *******為甚麼這裡要return？
      .then(restaurant => {
        if (!restaurant) throw new Error('這間餐廳不存在!') // *******為甚麼要加這行判斷?
        return restaurant.destroy()
      })
      .then(() => res.redirect('/admin/restaurants'))
      .catch(err => next(err))
  }
}
module.exports = adminController
