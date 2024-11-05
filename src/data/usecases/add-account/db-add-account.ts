import {AddAccount, AddAccountModel , AccountModel, Encrypter, AddAccountRepository } from './db-add-account-protocols'


export class DbAddAccount  implements AddAccount {

    private readonly encrypter: Encrypter
    private readonly addAccountRepository: AddAccountRepository
    constructor (encrypter: Encrypter, addAccountRepository: AddAccountRepository) {
        this.encrypter = encrypter
        this.addAccountRepository = addAccountRepository
    }

    async add(account: AddAccountModel): Promise<AccountModel> {
        await this.encrypter.encrypt(account.password)
        await this.addAccountRepository.add(Object.assign({}, account, {password: 'hashed_password'}))
        
        return new Promise(resolve => resolve(null))
    }
}