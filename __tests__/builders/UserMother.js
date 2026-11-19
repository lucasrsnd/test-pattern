import { User } from '../../src/domain/User.js';

/**
 * Object Mother: cria usuários comuns e fixos usados em vários testes.
 * Útil aqui porque User é uma entidade simples cujas variações
 * relevantes para os testes (PADRAO x PREMIUM) são poucas e estáveis.
 */
export class UserMother {
    static umUsuarioPadrao() {
        return new User(1, 'João da Silva', 'joao@email.com', 'PADRAO');
    }

    static umUsuarioPremium() {
        return new User(2, 'Maria Premium', 'premium@email.com', 'PREMIUM');
    }
}
