import { fastify } from 'fastify'
import './config'
import useRoutes from './routes'
import fastifyCookie from '@fastify/cookie'

const app = fastify()
app.register(fastifyCookie)
useRoutes(app)

export default app
