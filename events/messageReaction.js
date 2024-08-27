import { Events } from 'discord.js';

export default {
    name: Events.Raw,
    async execute(client, data) {
        // Verifica se o evento é de adição ou remoção de reação
        if (data.t !== "MESSAGE_REACTION_ADD" && data.t !== "MESSAGE_REACTION_REMOVE") return;

        // Verifica se a reação foi adicionada à mensagem específica
        if (data.d.message_id !== "1277840600690851902") return;

        // Obtém o servidor usando o ID fornecido
        const server = client.guilds.cache.get("1277460588930535458");
        if (!server) return console.error("Servidor não encontrado");

        // Obtém o membro usando o ID do usuário que reagiu
        const member = await server.members.fetch(data.d.user_id).catch(console.error);
        if (!member) return console.error("Membro não encontrado");

        // Obtém os cargos usando seus IDs
        const roles = {
            '1277727793735667742': '1277842861001412700', // Gif Estragado
            '⭐': '1277843063414198342', // Sonho
            '🚂': '1277843132280733698', // Falsas Promessas
            '💴': '1277843188236812320', // Dinheiro Fácil
            '1277850481573629993': '1277843242796322940'  // Frio e Calculista
        };

        const roleId = roles[data.d.emoji.id || data.d.emoji.name];
        if (!roleId) return console.error("Cargo não encontrado para o emoji");

        const role = server.roles.cache.get(roleId);
        if (!role) return console.error("Cargo não encontrado");

        try {
            if (data.t === "MESSAGE_REACTION_ADD") {
                if (!member.roles.cache.has(role.id)) {
                    await member.roles.add(role);
                    console.log(`Cargo ${role.name} adicionado ao membro ${member.user.tag}`);
                }
            } else if (data.t === "MESSAGE_REACTION_REMOVE") {
                if (member.roles.cache.has(role.id)) {
                    await member.roles.remove(role);
                    console.log(`Cargo ${role.name} removido do membro ${member.user.tag}`);
                }
            }
        } catch (error) {
            console.error('Erro ao adicionar/remover cargo:', error);
        }
    }
};