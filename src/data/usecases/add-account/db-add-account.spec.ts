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
})