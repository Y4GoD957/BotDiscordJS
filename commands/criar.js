import db from '../utils/db.js';

// Adiciona um novo perfil ao banco de dados
export default {
    name: 'criar',
    description: 'Cria um perfil para o usuário.',
    async execute(message) {
        try {
            // Ler o estado atual do banco de dados
            await db.read();

            // Inicializar o array de perfis para a guilda se não existir
            if (!db.data[message.guild.id]) {
                db.data[message.guild.id] = [];
            }

            // Adicionar o perfil do usuário ao banco de dados
            db.data[message.guild.id].push({
                id: message.author.id,
                nick: message.author.username,
                avatar: message.author.displayAvatarURL(),
            });

            // Salvar as mudanças no banco de dados
            await db.write();
            
            // Enviar confirmação no canal
            message.channel.send('Perfil criado com sucesso!');
        } catch (error) {
            console.error('Erro ao criar perfil:', error);
            message.channel.send('Ocorreu um erro ao criar o perfil.');
        }
    }
};