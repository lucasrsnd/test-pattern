import { CheckoutService } from '../src/services/CheckoutService.js';
import { Item } from '../src/domain/Item.js';
import { UserMother } from './builders/UserMother.js';
import { CarrinhoBuilder } from './builders/CarrinhoBuilder.js';

describe('CheckoutService', () => {
    describe('quando o pagamento falha', () => {
        it('deve retornar null e não deve chamar o repository nem o email service', async () => {
            // Arrange
            const carrinho = new CarrinhoBuilder().build();

            const gatewayStub = {
                cobrar: jest.fn().mockResolvedValue({ success: false }),
            };
            // Dummies: nunca devem ser chamados neste cenário.
            const repositoryDummy = { salvar: jest.fn() };
            const emailDummy = { enviarEmail: jest.fn() };

            const checkoutService = new CheckoutService(gatewayStub, repositoryDummy, emailDummy);

            // Act
            const pedido = await checkoutService.processarPedido(carrinho, 'cartao-123');

            // Assert (Verificação de Estado)
            expect(pedido).toBeNull();
            expect(repositoryDummy.salvar).not.toHaveBeenCalled();
            expect(emailDummy.enviarEmail).not.toHaveBeenCalled();
        });
    });

    describe('quando um cliente padrão finaliza a compra', () => {
        it('deve salvar o pedido com o totalFinal correto, sem desconto', async () => {
            // Arrange
            const userPadrao = UserMother.umUsuarioPadrao();
            const carrinho = new CarrinhoBuilder()
                .comUser(userPadrao)
                .comItens([new Item('Produto X', 100)])
                .build();

            const gatewayStub = { cobrar: jest.fn().mockResolvedValue({ success: true }) };
            const repositoryStub = {
                salvar: jest.fn().mockResolvedValue({ id: 1, totalFinal: 100, status: 'PROCESSADO' }),
            };
            const emailDummy = { enviarEmail: jest.fn().mockResolvedValue() };

            const checkoutService = new CheckoutService(gatewayStub, repositoryStub, emailDummy);

            // Act
            const pedido = await checkoutService.processarPedido(carrinho, 'cartao-123');

            // Assert (Verificação de Estado)
            expect(pedido.totalFinal).toBe(100);
            expect(gatewayStub.cobrar).toHaveBeenCalledWith(100, 'cartao-123');
        });
    });

    describe('quando um cliente Premium finaliza a compra', () => {
        it('deve aplicar 10% de desconto no pagamento e notificar o cliente por e-mail', async () => {
            // Arrange
            const userPremium = UserMother.umUsuarioPremium();
            const carrinho = new CarrinhoBuilder()
                .comUser(userPremium)
                .comItens([new Item('Produto Premium', 200)])
                .build();

            // Stubs: apenas fornecem respostas pré-definidas para o fluxo acontecer.
            const gatewayStub = { cobrar: jest.fn().mockResolvedValue({ success: true }) };
            const repositoryStub = {
                salvar: jest.fn().mockResolvedValue({ id: 10, totalFinal: 180, status: 'PROCESSADO' }),
            };
            // Mock: suas chamadas e argumentos serão verificados (Behavior Verification).
            const emailMock = { enviarEmail: jest.fn().mockResolvedValue() };

            const checkoutService = new CheckoutService(gatewayStub, repositoryStub, emailMock);

            // Act
            const pedido = await checkoutService.processarPedido(carrinho, 'cartao-456');

            // Assert (Verificação de Comportamento)
            expect(gatewayStub.cobrar).toHaveBeenCalledWith(180, 'cartao-456');
            expect(emailMock.enviarEmail).toHaveBeenCalledTimes(1);
            expect(emailMock.enviarEmail).toHaveBeenCalledWith(
                'premium@email.com',
                'Seu Pedido foi Aprovado!',
                'Pedido 10 no valor de R$180'
            );

            // Assert (Verificação de Estado, complementar)
            expect(pedido.totalFinal).toBe(180);
        });
    });
});
