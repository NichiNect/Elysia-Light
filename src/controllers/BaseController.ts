export class BaseController {
    static async index() {
        return {
            message: `Welcome to the API of ${process.env.APP_NAME}!`,
        };
    }
}