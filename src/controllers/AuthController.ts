import { ControllerContext } from "elysia"
import bcrypt from 'bcrypt';
import User from "@/models/User"
import { Auth } from '@/utils/auth.utils';

export class AuthController {
    // =============================================>
    // ## Login with email & password
    // =============================================>
    static async login(c: ControllerContext) {
        c.validation({
            email     :  "required",
            password  :  "required",
        })

        const { email, password } = c.body as Record<string, any>

        const result = await User.query().where("email", email).first();

        if (!result) return { status: 422, body: { message: 'Invalid credentials' } }

        const user = result.toJSON()

        const checkPassword = await bcrypt.compare(password, user.password)
        if (!checkPassword) return { status: 422, body: { message: 'Invalid credentials' } }
        
        const { token } = await Auth.createPersonalToken(user.id)

        c.responseSuccess({ user, token }, "Success")
    }

    // =============================================>
    // ## Login with email & password
    // =============================================>
    static async me(c: ControllerContext) {
        if (!c.user) {
            throw c.status(401, {
                message: "Unauthorized!"
            })
        }

        c.responseSuccess({  user: c.user }, "Success")
    }
}