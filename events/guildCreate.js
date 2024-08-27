import db from '../utils/db.js'; // Importa o banco de dados

export default {
    name: 'guildCreate',
    async execute(client, guild) {
        console.log(`O bot entrou no servidor: ${guild.name} (id: ${guild.id}). População: ${guild.memberCount} membros!`);
        client.user.setActivity(`Estou em ${client.guilds.cache.size} servidores`);

        await db.read();
        db.data[guild.id] = db.data[guild.id] || [];
        await db.write();
    }
};