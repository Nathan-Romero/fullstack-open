const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (request, response, next) => {
  const { username, name, password } = request.body

  if (!username || !password) {
    return response.status(400).json({
      error: 'username and password are required'
    })
  }

  if (username.length < 3) {
    return response.status(400).json({
      error: 'username must be at least 3 characters long'
    })
  }

  if (password.length < 3) {
    return response.status(400).json({
      error: 'password must be at least 3 characters long'
    })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
  })

  try {
    const savedUser = await user.save()
    response.status(201).json(savedUser)
  } catch (error) {
    next(error)
  }
})

usersRouter.get('/', async (request, response) => {
  const users = await User
    .find({}).populate('blogs', { url: 1, title: 1, author: 1, id: 1 })
  response.json(users)
})

usersRouter.delete('/:id', async (request, response) => {
  try {
    const result = await User.findByIdAndDelete(request.params.id)

    if (result) {
      response.status(204).end()
    } else {
      response.status(404).json({ error: 'user not found' })
    }
  } catch {
    response.status(400).json({ error: 'malformatted id' })
  }
})

module.exports = usersRouter