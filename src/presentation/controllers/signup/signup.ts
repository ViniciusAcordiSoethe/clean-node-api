import { HttpRequest , HttpResponse , Controller, EmailValidator , AddAccount} from "./signup.protocols"
import { MissingParamsError, InvalidParamsError  } from "../../errors"
import { badRequest, serverError } from "../../helpers/http-helper"

export class SignUpController implements Controller {
    private readonly emailValidator: EmailValidator
    private readonly addAccount: AddAccount
    constructor(emailValidator: EmailValidator , addAccount: AddAccount) {
        this.emailValidator = emailValidator
        this.addAccount = addAccount
    }
    handle(httpRequest: HttpRequest) : HttpResponse {
        try {
            const requiredFields = ['name', 'email', 'password']
            const { name, email, password } = httpRequest.body
            
            for (const field of requiredFields) {
                if(!httpRequest.body[field]) {
                    return badRequest(new MissingParamsError(field))
                }
            }
            const emailIsValid = this.emailValidator.isValid(email)

            if(!emailIsValid) {
                return badRequest(new InvalidParamsError('email'))
            }

            const account = this.addAccount.add({
                name,
                email,
                password
            })
        
            return {
                statusCode: 200,
                body: account
            }
        }catch(error) {
            return serverError()
        }
    }
}