import { HttpRequest , HttpResponse} from "../protocols/http"
import { MissingParamsError } from "../errors/missing-params-error"
import { InvalidParamsError } from "../errors/invalid-params-error"
import { badRequest } from "../helpers/http-helper"
import { Controller } from "../protocols/controller"
import { EmailValidator } from "../protocols/email-validator"
 
export class SignUpController implements Controller {
    private readonly emailValidator: EmailValidator
    constructor(emailValidator: EmailValidator) {
        this.emailValidator = emailValidator
    }
    handle(httpRequest: HttpRequest) : HttpResponse {
        const requiredFields = ['name', 'email', 'password']

        for (const field of requiredFields) {
            if(!httpRequest.body[field]) {
                return badRequest(new MissingParamsError(field))
            }
        }
        const emailIsValid = this.emailValidator.isValid(httpRequest.body.email)

        if(!emailIsValid) {
            return badRequest(new InvalidParamsError('email'))
        }
        return {
            statusCode: 200,
            body: {
                name: httpRequest.body.name,
                email: httpRequest.body.email
            }
        }
    }
}