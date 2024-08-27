export default {
    name: 'messageReactionAdd',
    async execute(client, dados) {
        if (dados.t !== "MESSAGE_REACTION_ADD" && dados.t !== "MESSAGE_REACTION_REMOVE") return;
        if (dados.d.message_id !== "1277840600690851902") return;

        const servidor = client.guilds.cache.get("1277460588930535458");
        if (!servidor) return console.error("Servidor não encontrado");

        const membro = await servidor.members.fetch(dados.d.user_id).catch(console.error);
        if (!membro) return console.error("Membro não encontrado");

        const roles = {
            '1277727793735667742': '1277842861001412700', // Gif Estragado
            '⭐': '1277843063414198342', // Sonho
            '🚂': '1277843132280733698', // Falsas Promessas
            '💴': '1277843188236812320', // Dinheiro Fácil
            '1277850481573629993': '1277843242796322940'  // Frio e Calculista
        };

        const roleId = roles[dados.d.emoji.id || dados.d.emoji.name];
        if (!roleId) return;

        const role = servidor.roles.cache.get(roleId);
        if (!role) return console.error("Cargo não encontrado");

        if (dados.t === "MESSAGE_REACTION_ADD") {
            if (!membro.roles.cache.has(role.id)) {
                await membro.roles.add(role).catch(console.error);
            }
        } else if (dados.t === "MESSAGE_REACTION_REMOVE") {
            if (membro.roles.cache.has(role.id)) {
                await membro.roles.remove(role).catch(console.error);
            }
        }
    }
};