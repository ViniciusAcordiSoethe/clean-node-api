import { HttpRequest , HttpResponse} from "../protocols/http"
import { MissingParamsError } from "../errors/missing-params-error"
import { badRequest } from "../helpers/http-helper"
import { Controller } from "../protocols/controller"
 
export class SignUpController implements Controller {
    handle(httpRequest: HttpRequest) : HttpResponse {
        const requiredFields = ['name', 'email', 'password']

        for (const field of requiredFields) {
            if(!httpRequest.body[field]) {
                return badRequest(new MissingParamsError(field))
            }
        }
        return {
            statusCode: 200,
            body: 'ok'
        }
    }
}