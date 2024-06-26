import { SignUpController } from "./signup"
import { MissingParamsError, InvalidParamsError , ServerError  } from "../../errors"
import { EmailValidator, AddAccount, AddAccountModel, AccountModel } from "./signup.protocols"

const makeEmailValidator = (): EmailValidator => {
    class EmailValidatorStub implements EmailValidator {
        isValid(email: string): boolean {
            return true
        }
    }
    return new EmailValidatorStub()
}

const makeAddAccount = (): AddAccount => {
    class AddAccountStub implements AddAccount {
        async add(account: AddAccountModel): Promise<AccountModel>  {
            const fakeAccount = {
                id: 'valid_id',
                name: 'valid_name',
                email: 'valid_email@valid_email.com',
                password: 'valid_password'
            }
            return new Promise(resolve => resolve(fakeAccount))
        }
    }
    return new AddAccountStub()
}

interface SutTypes {
    sut: SignUpController
    emailValidatorStub: EmailValidator
    addAccountStub: AddAccount
}

const makeSut = (): SutTypes => { 
    const emailValidatorStub = makeEmailValidator()
    const addAccountStub = makeAddAccount()

    const sut = new SignUpController(emailValidatorStub, addAccountStub)
    return {
        sut,
        emailValidatorStub,
        addAccountStub
    }
}

describe('SignUp Controller', () => {
    test('Should return 400 if no name is provided', async () => {
        const {sut} = makeSut()
        const httpRequest = {
            body: {
                email: "any_email",
                password: "any_password",
                passwordConfirmation: "any_password"
            }
        }
        const httpResponse = await sut.handle(httpRequest)
        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new MissingParamsError('name'))
    })

    test('Should return 400 if no email is provided', async () => {
        const {sut} = makeSut()
        const httpRequest = {
            body: {
                name: "any_name",
                password: "any_password",
                passwordConfirmation: "any_password"
            }
        }
        const httpResponse = await sut.handle(httpRequest)
        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new MissingParamsError('email'))
    })

    test('Should return 400 if no password is provided', async () => {
        const {sut} = makeSut()
        const httpRequest = {
            body: {
                name: "any_name",
                email: "any_email@any_email.com",
            }
        }
        const httpResponse = await sut.handle(httpRequest)
        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new MissingParamsError('password'))
    })

    test('Should return 400 if invalid email is provided', async () => {
        const {sut , emailValidatorStub} = makeSut()
        jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false)
        const httpRequest = {
            body: {
                name: "any_name",
                email: "any_email@any_email.com",
                password: "any_password"
            }
        }
        const httpResponse = await sut.handle(httpRequest)
        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new InvalidParamsError('email'))
    })

    test('Should call email validator with correct email', async () => {
        const {sut , emailValidatorStub} = makeSut()
        const isValidSpy = jest.spyOn(emailValidatorStub, 'isValid')
        const httpRequest = {
            body: {
                name: "any_name",
                email: "any_email@any_email.com",
                password: "any_password"
            }
        }
        await sut.handle(httpRequest)
        expect(isValidSpy).toHaveBeenCalledWith('any_email@any_email.com')
    })

    test('Shold return 500 if EmailValidator throws', async () => {

       const {sut , emailValidatorStub} = makeSut()
       jest.spyOn(emailValidatorStub, 'isValid').mockImplementationOnce(() => {
           throw new Error()
       })
       const httpRequest = {
           body: {
               name: "any_name",
               email: "any_email@any_email.com",
               password: "any_password"
           }
       }

       const httpResponse = await sut.handle(httpRequest)
       expect(httpResponse.statusCode).toBe(500)
       expect(httpResponse.body).toEqual(new ServerError())
    })

    test('Should call AddAccount with correct values', async () => {
        const {sut , addAccountStub} = makeSut()
        const addSpy = jest.spyOn(addAccountStub, 'add')
        const httpRequest = {
            body: {
                name: "any_name",
                email: "any_email@any_email.com",
                password: "any_password"
            }
        }
        await sut.handle(httpRequest)
        expect(addSpy).toHaveBeenCalledWith({
            name: "any_name",
            email: "any_email@any_email.com",
            password: "any_password"
        })
    })

    test('Shold return 500 if addAccount throws', async () => {

       const {sut , addAccountStub} = makeSut()
       jest.spyOn(addAccountStub, 'add').mockImplementationOnce( async () => {
           return Promise.reject(new Error())
       })
       const httpRequest = {
           body: {
               name: "any_name",
               email: "any_email@any_email.com",
               password: "any_password"
           }
       }

       const httpResponse = await sut.handle(httpRequest)
       expect(httpResponse.statusCode).toBe(500)
       expect(httpResponse.body).toEqual(new ServerError())
    })
    
    test('Should return 200 if valid data is provided', async () => {
        const {sut} = makeSut()
        const httpRequest = {
            body: {
                name: "valid_name",
                email: "valid_email@valid_email.com",
                password: "valid_password"
            }
        }
        const httpResponse = await sut.handle(httpRequest)
        expect(httpResponse.statusCode).toBe(200)
        expect(httpResponse.body).toEqual({
            id: 'valid_id',
            name: 'valid_name',
            email: 'valid_email@valid_email.com',
            password: 'valid_password'
        })
    })
})