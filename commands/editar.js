import db from '../utils/db.js';

// Edita o perfil do usuário
export default {
    name: 'editar',
    description: 'Edita o nome do perfil do usuário.',
    async execute(message, args) {
        try {
            // Garantir que o argumento do novo nome foi fornecido
            if (!args[0]) {
                return message.channel.send('Você esqueceu de fornecer o novo nome!');
            }
            const novoNome = args[0];

            // Ler o estado atual do banco de dados
            await db.read();

            // Verificar se há perfis para a guilda atual
            if (!db.data[message.guild.id]) {
                return message.channel.send('Nenhum perfil encontrado para este servidor.');
            }

            // Buscar o perfil do usuário baseado no ID
            const user = db.data[message.guild.id].find(user => user.id === message.author.id);
            if (user) {
                // Atualizar o nome de usuário (nick) no banco de dados
                user.nick = novoNome;

                // Salvar as mudanças no banco de dados
                await db.write();

                // Confirmar a edição do perfil
                message.channel.send('Perfil editado com sucesso!');
            } else {
                // Caso o usuário não tenha um perfil criado
                message.channel.send('Usuário não encontrado!');
            }
        } catch (error) {
            console.error('Erro ao editar perfil:', error);
            message.channel.send('Ocorreu um erro ao editar o perfil.');
        }
    }
};