const bcrypt = require('bcryptjs')
const db = require('../models')
const { User, Comment, Restaurant, Favorite, Like, Followship } = db
const { imgurFileHandler } = require('../helpers/file-helpers')

const userController = {
  signUpPage: (req, res) => {
    res.render('signup')
  },
  signUp: (req, res, next) => {
    if (req.body.password !== req.body.passwordCheck) throw new Error('Passwords do not match!')
    User.findOne({ where: { email: req.body.email } })
      .then(user => {
        if (user) throw new Error('Email already exists!')
        return bcrypt.hash(req.body.password, 10)
      })
      .then(hash => User.create({
        name: req.body.name,
        email: req.body.email,
        password: hash
      }))
      .then(() => {
        req.flash('success_messages', '成功註冊帳號！')
        res.redirect('/signin')
      })
      .catch(error => next(error))
  },
  signInPage: (req, res) => {
    res.render('signin')
  },
  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/restaurants')
  },
  getUser: (req, res, next) => {
    const userId = Number(req.params.id)
    return User.findByPk(req.params.id, {
      include: [
        { model: Comment, include: Restaurant },
        { model: Restaurant, as: 'FavoritedRestaurants' },
        { model: User, as: 'Followers' },
        { model: User, as: 'Followings' }]
    })
      .then(user => {
        const restaurantArray = user.toJSON().Comments.map(i => i.Restaurant) // 先存進使用者評論過的資料
        const set = new Set() // 創建一set物件建構子要用來存放餐廳id
        // 對restaurantArray使用filter迭代陣列中的每個物件
        // 我們用set物件的has來查看它的id值是否存在set內，如果沒有，我們利用set.add將那個id傳入set中。
        // (set.has會回傳一個boolean，add則會將argument加入set中。)
        // filter只會將判斷為true的值丟進result中，所以重複已經在set內的將傳回false，所以最後結果只剩不重複物件。
        const resultCommentsRest = restaurantArray.filter(r => !set.has(r.id) ? set.add(r.id) : false)
        if (!user) throw new Error("This user did'nt exist!")
        res.render('users/profile', { userProfile: user.toJSON(), userId, resultCommentsRest })
      })
      .catch(err => next(err))
  },
  editUser: (req, res, next) => {
    if (req.user.id !== Number(req.params.id)) throw new Error('無權限變更他人帳戶!')
    return User.findByPk(req.params.id, {
      raw: true
    })
      .then(user => {
        if (!user) throw new Error("This user did'nt exist!")
        res.render('users/edit', { user })
      })
      .catch(err => next(err))
  },
  putUser: (req, res, next) => {
    if (req.user.id !== Number(req.params.id)) throw new Error('無權限變更他人帳戶!')
    const { name } = req.body
    const { file } = req
    return Promise.all([
      User.findByPk(req.params.id),
      imgurFileHandler(file)
    ])
      .then(([user, filePath]) => {
        if (!user) throw new Error("This user did'nt exist!")
        return user.update({
          name,
          avatar: filePath || user.avatar
        })
      })
      .then(() => {
        req.flash('success_messages', '使用者資料編輯成功')
        return res.redirect(`/users/${req.params.id}`)
      })
      .catch(err => next(err))
  },
  addFavorite: (req, res, next) => {
    const { restaurantId } = req.params
    return Promise.all([
      Restaurant.findByPk(restaurantId),
      Favorite.findOne({
        where: {
          userId: req.user.id,
          restaurantId
        }
      })
    ])
      .then(([restaurant, favorite]) => {
        if (!restaurant) throw new Error("Restaurant did'nt exist!")
        if (favorite) throw new Error('you hav favorited this restaurant')

        return Favorite.create({
          userId: req.user.id,
          restaurantId
        })
      })
      .then(() => {
        return res.redirect('back')
      })
      .catch(err => next(err))
  },
  removeFavorite: (req, res, next) => {
    return Favorite.findOne({
      where: {
        userId: req.user.id,
        restaurantId: req.params.restaurantId
      }
    })
      .then(favorite => {
        if (!favorite) throw new Error("You haven't favorited this restaurant")
        return favorite.destroy()
      })
      .then(() => {
        return res.redirect('back')
      })
      .catch(err => next(err))
  },
  addLike: (req, res, next) => {
    const { restaurantId } = req.params
    return Promise.all([
      Restaurant.findByPk(restaurantId),
      Like.findOne({
        where: {
          userId: req.user.id,
          restaurantId
        }
      })
    ])
      .then(([restaurant, like]) => {
        if (!restaurant) throw new Error("Restaurant did'nt exist!")
        if (like) throw new Error('you hav liked this restaurant')

        return Like.create({
          userId: req.user.id,
          restaurantId
        })
      })
      .then(() => {
        return res.redirect('back')
      })
      .catch(err => next(err))
  },
  removeLike: (req, res, next) => {
    return Like.findOne({
      where: {
        userId: req.user.id,
        restaurantId: req.params.restaurantId
      }
    })
      .then(like => {
        if (!like) throw new Error("You haven't Liked this restaurant")
        return like.destroy()
      })
      .then(() => {
        return res.redirect('back')
      })
      .catch(err => next(err))
  },
  getTopUsers: async (req, res, next) => {
    try {
      let users = await User.findAll({ include: [{ model: User, as: 'Followers' }] })
      users = users.map(user => ({
        ...user.toJSON(),
        followerCount: user.Followers.length,
        isFollowed: req.user.Followings.some(f => f.id === user.id)
      }))
        .sort((a, b) => b.followerCount - a.followerCount)
      return res.render('top-users', { users })
    } catch (error) {
      next(error)
    }
  },
  addFollowing: async (req, res, next) => {
    try {
      const { userId } = req.params
      const user = await User.findByPk(userId)
      const followship = await Followship.findOne({
        where: {
          followerId: req.user.id,
          followingId: userId
        }
      })
      if (!user) throw new Error("User did'nt exist!")
      if (followship) throw new Error('You are already following this user!')
      await Followship.create({ followerId: req.user.id, followingId: userId })
      return res.redirect('back')
    } catch (error) {
      next(error)
    }
  },
  removeFollowing: async (req, res, next) => {
    try {
      const { userId } = req.params
      const followship = await Followship.findOne({
        where: {
          followerId: req.user.id,
          followingId: userId
        }
      })
      if (!followship) throw new Error("You haven't followed this user!")
      await followship.destroy()
      return res.redirect('back')
    } catch (error) {
      next(error)
    }
  },
  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  }
}

module.exports = userController
