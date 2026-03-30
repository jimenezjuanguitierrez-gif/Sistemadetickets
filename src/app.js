import express from 'express'
import router from './routes/index.js'

import { notFound } from './middlewares/notFound.js'
import { errorHandler } from './middlewares/errorHandler.js'

const app = express()

app.use(express.json())

app.use('/api', router)

// SIEMPRE al final
app.use(notFound)
app.use(errorHandler)

export default app