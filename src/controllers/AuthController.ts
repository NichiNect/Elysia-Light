import { ControllerContext } from "elysia"
import bcrypt from 'bcrypt';
import User from "@/models/User"
import { Auth } from '@/utils/auth.utils';
import { db } from "@/utils/db.utils";
import UserMailToken from "@/mails/UserMailToken.mail";

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
        
        const { token } = await Auth.createAccessToken(user.id)

        c.responseSuccess({ user, token }, "Success")
    }


    // =============================================>
    // ## Register new account.
    // =============================================>
    static async register(c: ControllerContext) {
        c.validation({
            name      :  "required",
            email     :  "required",
            password  :  "required",
        })

        const trx = await db.beginTransaction()

        const { email } = c.body as Record<string, any>

        await User.query().where("email", email).whereNull("email_verification_at").delete();
        
        const model = new User().dumpField(c.body as Record<string, any>)

        try {
            await model.save({ trx })            
        } catch (err) {
            await trx.rollback()
            c.responseError(err as Error, "Create User")
        }

        const user = model.toJSON()

        const { token } = await Auth.createAccessToken(user.id)

        const { token: mailToken } = await Auth.createUserMailToken(user.id)
        
        await UserMailToken(user, mailToken)

        await trx.commit()

        c.responseSuccess({ user, token }, "Success")
    }


    // =============================================>
    // ## Verify user mail token.
    // =============================================>
    static async verify(c: ControllerContext) {
        c.validation({
            token      :  "required",
        })

        const { token } = c.body as Record<string, any>

        if (!c.user) {
            throw c.status(401, {
                message: "Unauthorized!"
            })
        }

        const verify = await Auth.verifyUserMailToken(c?.user?.id, token);
        if(!verify)  {
            c.responseErrorValidation({token: ["Invalid Token!"]})
        }

        c.responseSuccess({ user: c.user }, "Success")
    }


    // =============================================>
    // ## get logged account
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