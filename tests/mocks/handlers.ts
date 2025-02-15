import { rest } from 'msw'

export const handlers = [
  rest.post('/api/chat', (req, res, ctx) => {
    return res(
      ctx.json({
        message: 'Mock response'
      })
    )
  })
]