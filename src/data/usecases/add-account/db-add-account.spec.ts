import { DbAddAccount } from './db-add-account'
import { Encrypter } from '../../protocols/encrypter'

interface SutTypes {
    sut: DbAddAccount
    encrypterStub: Encrypter 
}

const makeEncrypter = (): Encrypter => {
    class EncrypterStub implements Encrypter {
        async encrypt(password: string): Promise<string> {
            return new Promise(resolve => resolve('hashed_password'))
        }
    }
    return new EncrypterStub()
}
const makeSut = (): any => {

    const encrypterStub = makeEncrypter()
    const sut = new DbAddAccount(encrypterStub)
    return {sut, encrypterStub}
}

describe('DBAddAccount Usecase', () => {
    test('Should call Encrypter with correct password', async () => {
        const { sut, encrypterStub } = makeSut()
        const encrypterSpy = jest.spyOn(encrypterStub, 'encrypt')
        const accountData = {
            name: 'valid_name',
            email: 'valid_email@valid_email.com',
            password: 'valid_password'
        }
        sut.add(accountData)
        expect(encrypterSpy).toHaveBeenCalledWith('valid_password')
    })

    test('Should throw if Encrypter throws', async () => {
        const { sut, encrypterStub } = makeSut()
        jest.spyOn(encrypterStub, 'encrypt').mockReturnValueOnce(
            new Promise((resolve, reject) => reject(new Error()))
        )
        const accountData = {
            name: 'valid_name',
            email: 'valid_email@valid_email.com',
            password: 'valid_password'
        }
        const promise = sut.add(accountData)
        await expect(promise).rejects.toThrow()
    })

    test('Should return an account on success', async () => {
        const { sut } = makeSut()
        const accountData = {
            name: 'valid_name',
            email: 'valid_email@valid_email.com',
            password: 'valid_password'
        }
        const account = await sut.add(accountData)
        expect(account).toEqual({
            id: 'valid_id',
            name: 'valid_name',
            email: 'valid_email@valid_email.com',
            password: 'hashed_password'
        })
    })
})