import db from '../utils/db.js'; // Importa o banco de dados

export default {
    name: 'guildDelete',
    async execute(client, guild) {
        console.log(`O bot foi removido do servidor: ${guild.name} (id: ${guild.id})`);
        client.user.setActivity(`Estou em ${client.guilds.cache.size} servidores`);

        await db.read();
        delete db.data[guild.id];
        await db.write();
    }
};