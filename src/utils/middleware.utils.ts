import { Elysia, status } from 'elysia'
import { Auth } from './auth.utils'
import User from '@/models/User'


// =============================>
// ## Auth Middleware
// =============================>
export const AuthMiddleware = (app: Elysia) => app.derive(async ({ request }) => {
    const authHeader = request.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw status(401, {
            message: "Unauthorized!"
        })
    }

    const bearer = authHeader.substring(7).trim()
    const result = await Auth.verifyPersonalToken(bearer)

    if (!result || !result.user) {
        throw status(401, {
            message: "Unauthorized!"
        })
    }

    return {
        user: result.user
    }
})

// =============================>
// ## Cors Middleware
// =============================>
export const CorsMiddleware = (app: Elysia) => app.onRequest(({ request, set }) => {
    const origin                       = request.headers.get('origin') ?? ''
    let allowedOrigin: string          = '*'

    const originsConf = process.env.CORS_ORIGINS || '*'

    if (originsConf !== '*') {
        try {
            const allowedOrigins = JSON.parse(originsConf)

            if (Array.isArray(allowedOrigins) && allowedOrigins.includes(origin)) {
                allowedOrigin = origin || ""
            }
        } catch (e) {
            console.error('Error: Failed to parse CORS_ORIGINS, fallback to "*"')
            allowedOrigin = ''
        }
    }
    
    set.headers['Access-Control-Allow-Origin']      = allowedOrigin
    set.headers['Access-Control-Allow-Methods']     = process.env.CORS_METHODS || 'GET, POST, PUT, DELETE, OPTIONS'
    set.headers['Access-Control-Allow-Headers']     = 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    set.headers['Access-Control-Allow-Credentials'] = 'true'

    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, })
    }
})