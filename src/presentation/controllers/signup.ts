import { HttpRequest , HttpResponse , Controller , EmailValidator} from "../protocols"
import { MissingParamsError, InvalidParamsError  } from "../errors"
import { badRequest, serverError } from "../helpers/http-helper"
import { AddAccount } from "../../domain/usecases/add-account"
 
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

            for (const field of requiredFields) {
                if(!httpRequest.body[field]) {
                    return badRequest(new MissingParamsError(field))
                }
            }
            const emailIsValid = this.emailValidator.isValid(httpRequest.body.email)

            if(!emailIsValid) {
                return badRequest(new InvalidParamsError('email'))
            }

            this.addAccount.add({
                name: httpRequest.body.name,
                email: httpRequest.body.email,
                password: httpRequest.body.password
            })
        }catch(error) {
            return serverError()
        }
    }
}