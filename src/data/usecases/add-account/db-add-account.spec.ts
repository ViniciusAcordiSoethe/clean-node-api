import { DbAddAccount } from './db-add-account'
import { Encrypter, AddAccountModel, AccountModel , AddAccountRepository } from './db-add-account-protocols'



const makeEncrypter = (): Encrypter => {
    class EncrypterStub implements Encrypter {
        async encrypt(password: string): Promise<string> {
            return new Promise(resolve => resolve('hashed_password'))
        }
    }
    return new EncrypterStub()
}

const makeAddAccountRepository = (): AddAccountRepository => {
    class AddAccountRepositoryStub implements AddAccountRepository{
        async add(account: AddAccountModel): Promise<AccountModel> {
            const fakeAccount = {
                id: 'valid_id',
                name: 'valid_name',
                email: 'valid_email@valid_email.com',
                password: 'hashed_password'
            }
            return new Promise(resolve => resolve(fakeAccount))
        }
    }
    return new AddAccountRepositoryStub()
}

interface SutTypes {
    sut: DbAddAccount
    encrypterStub: Encrypter 
    addAccountRepositoryStub: AddAccountModel
}

const makeSut = (): any => {

    const encrypterStub = makeEncrypter()
    const addAccountRepositoryStub = makeAddAccountRepository()
    const sut = new DbAddAccount(encrypterStub , addAccountRepositoryStub)
    return {sut, encrypterStub , addAccountRepositoryStub}
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
        const { sut, addAccountRepositoryStub } = makeSut()
        const addSpy = jest.spyOn(addAccountRepositoryStub, 'add')
        const accountData = {
            name: 'valid_name',
            email: 'valid_email@valid_email.com',
            password: 'valid_password'
        }
        await sut.add(accountData)
        expect(addSpy).toHaveBeenCalledWith({
            name: 'valid_name',
            email: 'valid_email@valid_email.com',
            password: 'hashed_password'
        })
    })
})