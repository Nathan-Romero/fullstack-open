const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body

  if (!body.title || !body.url) {
    return response.status(400).json({
      error: 'title or url missing'
    })
  }

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0
  })

  try {
    const savedBlog = await blog.save()
    response.status(201).json(savedBlog)
  } catch (error) {
    if (error.name === 'ValidationError') {
      return response.status(400).json({ error: error.message })
    }
    response.status(500).json({ error: 'Something went wrong' })
  }
})

blogsRouter.delete('/:id', async (request, response) => {
  try {
    const result = await Blog.findByIdAndDelete(request.params.id)

    if (result) {
      response.status(204).end()
    } else {
      response.status(404).json({ error: 'blog not found' })
    }
  } catch {
    response.status(400).json({ error: 'malformatted id' })
  }
})

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  }

  try {
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true, runValidators: true })
    if (updatedBlog) {
      response.json(updatedBlog)
    } else {
      response.status(404).json({ error: 'blog not found' })
    }
  } catch {
    response.status(400).json({ error: 'malformatted id' })
  }
})

module.exports = blogsRouter