const { GraphQLError } = require('graphql')

const handleGraphQLError = (error, code = null) => {
  if (code) {
    return new GraphQLError(error.message, {
      extensions: { code }
    })
  }

  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map(err => err.message)
    return new GraphQLError(`Validation error: ${messages.join(', ')}`, {
      extensions: {
        code: 'BAD_USER_INPUT',
        validationErrors: messages
      }
    })
  }

  if (error.name === 'MongoServerError' && error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0]
    return new GraphQLError(`${field.charAt(0).toUpperCase() + field.slice(1)} must be unique`, {
      extensions: {
        code: 'BAD_USER_INPUT',
        invalidArgs: field
      }
    })
  }

  return new GraphQLError(`Operation failed: ${error.message}`, {
    extensions: {
      code: 'INTERNAL_SERVER_ERROR',
      error
    }
  })
}

module.exports = { handleGraphQLError }