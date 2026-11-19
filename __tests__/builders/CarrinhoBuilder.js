import { Carrinho } from '../../src/domain/Carrinho.js';
import { Item } from '../../src/domain/Item.js';
import { UserMother } from './UserMother.js';

/**
 * Data Builder: cria instâncias de Carrinho de forma fluente e customizável.
 * Carrinho é uma entidade complexa (usuário variável, lista de itens
 * variável, pode estar vazio), por isso um Object Mother geraria uma
 * explosão de métodos combinatórios. O Builder resolve isso oferecendo
 * um padrão razoável e permitindo customizar só o que importa para cada teste.
 */
export class CarrinhoBuilder {
    constructor() {
        this.user = UserMother.umUsuarioPadrao();
        this.itens = [new Item('Item Padrão', 100)];
    }

    comUser(user) {
        this.user = user;
        return this;
    }

    comItens(itens) {
        this.itens = itens;
        return this;
    }

    vazio() {
        this.itens = [];
        return this;
    }

    build() {
        return new Carrinho(this.user, this.itens);
    }
}
