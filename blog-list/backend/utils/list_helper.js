const _ = require('lodash')

const dummy = () => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return null
  }

  return blogs.reduce((favorite, current) => {
    return current.likes > favorite.likes ? current : favorite
  }, blogs[0])
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return null
  }
  // Group blogs by author and count them
  const counts = _.countBy(blogs, 'author')

  // Find the author with the highest count
  const topAuthor = Object.entries(counts).reduce(
    (max, [author, count]) => count > max.count ? { author, count } : max,
    { author: '', count: 0 }
  )

  return {
    author: topAuthor.author,
    blogs: topAuthor.count
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
}