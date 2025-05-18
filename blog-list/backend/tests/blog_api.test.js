const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../app')
const helper = require('./test_helper')
const Blog = require('../models/blog')
const User = require('../models/user')

const api = supertest(app)

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({ username: 'testuser', passwordHash })
  const savedUser = await user.save()

  const blogObjects = helper.initialBlogs.map(blog => {
    return new Blog({
      ...blog,
      user: savedUser._id
    })
  })
  const savedBlogs = await Promise.all(blogObjects.map(blog => blog.save()))

  savedUser.blogs = savedBlogs.map(blog => blog._id)
  await savedUser.save()
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')
  assert.strictEqual(response.body.length, helper.initialBlogs.length)
})

test('blog posts have id property instead of _id', async () => {
  const response = await api.get('/api/blogs')
  assert.strictEqual(response.body.length > 0, true)

  const blog = response.body[0]
  assert.strictEqual('id' in blog, true)
  assert.strictEqual('_id' in blog, false)
})

test('a valid blog can be added', async () => {
  const users = await helper.usersInDb()
  const user = await User.findById(users[0].id)
  const token = helper.getTokenForUser(user)

  const newBlog = {
    title: 'Test Blog',
    author: 'Test Author',
    url: 'https://testblog.com',
    likes: 5
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

  const titles = blogsAtEnd.map(blog => blog.title)
  assert(titles.includes('Test Blog'))

  const addedBlog = blogsAtEnd.find(blog => blog.title === 'Test Blog')
  assert.strictEqual(addedBlog.author, 'Test Author')
  assert.strictEqual(addedBlog.url, 'https://testblog.com')
  assert.strictEqual(addedBlog.likes, 5)
})

test('if likes property is missing, it defaults to 0', async () => {
  const users = await helper.usersInDb()
  const user = await User.findById(users[0].id)
  const token = helper.getTokenForUser(user)

  const newBlog = {
    title: 'Blog without likes specified',
    author: 'Test Author',
    url: 'https://testblog.com'
  }

  const response = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.likes, 0)
})

test('blog without title is not added', async () => {
  const users = await helper.usersInDb()
  const user = await User.findById(users[0].id)
  const token = helper.getTokenForUser(user)

  const newBlog = {
    author: 'Test Author',
    url: 'https://testblog.com',
    likes: 5
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(400)
})

test('blog without url is not added', async () => {
  const users = await helper.usersInDb()
  const user = await User.findById(users[0].id)
  const token = helper.getTokenForUser(user)

  const newBlog = {
    title: 'Test Blog Without URL',
    author: 'Test Author',
    likes: 5
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(400)
})

test('a blog can be deleted', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToDelete = blogsAtStart[0]

  const users = await helper.usersInDb()
  const user = await User.findById(users[0].id)
  const token = helper.getTokenForUser(user)

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(204)

  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1)

  const titles = blogsAtEnd.map(blog => blog.title)
  assert(!titles.includes(blogToDelete.title))
})

test('returns 404 when trying to delete non-existent blog', async () => {
  const nonExistingId = await helper.nonExistingId()

  const users = await helper.usersInDb()
  const user = await User.findById(users[0].id)
  const token = helper.getTokenForUser(user)

  await api
    .delete(`/api/blogs/${nonExistingId}`)
    .set('Authorization', `Bearer ${token}`)  // Add token here
    .expect(404)
})

test('returns 400 when trying to delete with malformatted id', async () => {
  const users = await helper.usersInDb()
  const user = await User.findById(users[0].id)
  const token = helper.getTokenForUser(user)

  await api
    .delete('/api/blogs/malformatted-id')
    .set('Authorization', `Bearer ${token}`)  // Add token here
    .expect(400)
})

test('a blog\'s likes can be updated', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToUpdate = blogsAtStart[0]

  const users = await helper.usersInDb()
  const user = await User.findById(users[0].id)
  const token = helper.getTokenForUser(user)

  const updatedData = { ...blogToUpdate, likes: blogToUpdate.likes + 10 }

  const response = await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .set('Authorization', `Bearer ${token}`)  // Add token here
    .send(updatedData)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.likes, blogToUpdate.likes + 10)

  const blogInDb = await Blog.findById(blogToUpdate.id)
  assert.strictEqual(blogInDb.likes, blogToUpdate.likes + 10)
})

test('returns 404 if blog to update does not exist', async () => {
  const nonExistingId = await helper.nonExistingId()
  const updatedData = {
    title: 'Nonexistent',
    author: 'Nobody',
    url: 'http://none.com',
    likes: 1
  }

  const users = await helper.usersInDb()
  const user = await User.findById(users[0].id)
  const token = helper.getTokenForUser(user)

  await api
    .put(`/api/blogs/${nonExistingId}`)
    .set('Authorization', `Bearer ${token}`)  // Add this line
    .send(updatedData)
    .expect(404)
})

test('returns 400 for malformatted id', async () => {
  const updatedData = {
    title: 'Bad ID',
    author: 'Nobody',
    url: 'http://none.com',
    likes: 1
  }

  const users = await helper.usersInDb()
  const user = await User.findById(users[0].id)
  const token = helper.getTokenForUser(user)

  await api
    .put('/api/blogs/bad-id')
    .set('Authorization', `Bearer ${token}`)  // Add this line
    .send(updatedData)
    .expect(400)
})

test('adding a blog fails with status code 401 if token is not provided', async () => {
  const newBlog = {
    title: 'Unauthorized Blog',
    author: 'Anonymous',
    url: 'https://unauthorized.com',
    likes: 5
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(401)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
})

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    assert(usernames.includes(newUser.username))
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert(result.body.error.includes('expected `username` to be unique'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })
})

describe('when creating a new user', () => {
  test('fails with proper error if username is missing', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      name: 'No Username',
      password: 'validpassword'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    assert(result.body.error.includes('username'))

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('fails with proper error if password is missing', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'validuser',
      name: 'No Password'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    assert(result.body.error.includes('password'))

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('fails if username is less than 3 characters', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'ab',
      name: 'Short Username',
      password: 'validpassword'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    assert(result.body.error.includes('username'))

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('fails if password is less than 3 characters', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'validuser',
      name: 'Short Password',
      password: 'ab'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    assert(result.body.error.includes('password'))

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })
})

after(async () => {
  await mongoose.connection.close()
})