import exp from "constants"
import { EmailValidatorAdapter } from "./email-validator"
import validator from 'validator'

jest.mock('validator', () => ({
    isEmail(): boolean {
        return true
    }
}))

describe('EmailValidator Adapter', () => {
    test('Should return false if validator returns false', () => {
        const sut = new EmailValidatorAdapter()
        jest.spyOn(validator, 'isEmail').mockReturnValueOnce(false)
        expect(sut.isValid('invalid_email')).toBe(false)
    })

    test('Should return true if validator returns true', () => {
        const sut = new EmailValidatorAdapter()
        expect(sut.isValid('vallid_email@gmail.com')).toBe(true)
    })
})