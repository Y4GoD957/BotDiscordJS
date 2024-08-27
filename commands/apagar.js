import db from '../utils/db.js'; // Importa o banco de dados

export default {
    name: 'apagar',
    description: 'Apaga o perfil do usuário.',
    async execute(message, args) {
        try {
            // Ler o estado atual do banco de dados
            await db.read();

            // Verificar se há perfis para a guilda atual
            if (!db.data[message.guild.id]) {
                return message.channel.send('Não há perfis para apagar neste servidor.');
            }

            // Buscar o índice do perfil do usuário baseado no ID
            const index = db.data[message.guild.id].findIndex(user => user.id === message.author.id);
            
            if (index !== -1) {
                // Remover o perfil do usuário do banco de dados
                db.data[message.guild.id].splice(index, 1);

                // Salvar as mudanças no banco de dados
                await db.write();

                // Confirmar a exclusão do perfil
                message.channel.send('Perfil apagado com sucesso!');
            } else {
                // Caso o perfil não tenha sido encontrado
                message.channel.send('Perfil não encontrado!');
            }
        } catch (error) {
            console.error('Erro ao apagar perfil:', error);
            message.channel.send('Ocorreu um erro ao apagar o perfil.');
        }
    }
};