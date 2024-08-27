import { Client, GatewayIntentBits, Collection, Events } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtendo o caminho do diretório atual em ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar configuração
const configPath = path.join(__dirname, 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

// Configuração do cliente
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions
    ]
});

// Função para importar módulos dinamicamente
async function loadModule(filePath) {
    const moduleURL = new URL(`file:${filePath}`);
    return import(moduleURL.href);
}

// Carregar comandos
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    try {
        const command = await loadModule(filePath);
        if (!command.default || !command.default.name || !command.default.execute) {
            console.error(`O módulo de comando ${file} está mal formatado.`);
            continue;
        }
        client.commands.set(command.default.name, command.default);
    } catch (error) {
        console.error(`Erro ao carregar o comando ${file}:`, error);
    }
}

// Carregar eventos
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const eventName = file.split('.')[0];
    try {
        const event = await loadModule(filePath);
        if (!event.default) {
            console.error(`O módulo de evento ${file} está mal formatado.`);
            continue;
        }
        client.on(eventName, (...args) => event.default.execute(client, ...args));
    } catch (error) {
        console.error(`Erro ao carregar o evento ${file}:`, error);
    }
}

// Adiciona o listener para o evento 'raw'
client.on(Events.Raw, async (data) => {
    // Verifica se o evento é de adição ou remoção de reação
    if (data.t !== 'MESSAGE_REACTION_ADD' && data.t !== 'MESSAGE_REACTION_REMOVE') return;

    try {
        // Verifica se a reação foi adicionada à mensagem específica
        if (data.d.message_id !== '1277840600690851902') return;

        // Obtém o servidor usando o ID fornecido
        const servidor = client.guilds.cache.get('1277460588930535458');
        if (!servidor) throw new Error('Servidor não encontrado');

        // Obtém o membro usando o ID do usuário que reagiu
        const membro = await servidor.members.fetch(data.d.user_id);
        if (!membro) throw new Error('Membro não encontrado');

        // Obtém os cargos usando seus IDs
        const roles = {
            '1277727793735667742': '1277842861001412700', // Gif Estragado
            '⭐': '1277843063414198342', // Sonho
            '🚂': '1277843132280733698', // Falsas Promessas
            '💴': '1277843188236812320', // Dinheiro Fácil
            '1277850481573629993': '1277843242796322940'  // Frio e Calculista
        };

        const roleId = roles[data.d.emoji.id || data.d.emoji.name];
        if (!roleId) return console.error('Emoji não mapeado para um cargo');

        const role = servidor.roles.cache.get(roleId);
        if (!role) return console.error('Cargo não encontrado');

        if (data.t === 'MESSAGE_REACTION_ADD') {
            if (!membro.roles.cache.has(role.id)) {
                await membro.roles.add(role);
                console.log(`${role.name} adicionado a ${membro.user.tag}`);
            }
        } else if (data.t === 'MESSAGE_REACTION_REMOVE') {
            if (membro.roles.cache.has(role.id)) {
                await membro.roles.remove(role);
                console.log(`${role.name} removido de ${membro.user.tag}`);
            }
        }
    } catch (error) {
        console.error('Erro ao processar a reação:', error);
    }
});

// Evento de login
client.once('ready', () => {
    const totalUsers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
    const totalChannels = client.channels.cache.size;
    const totalGuilds = client.guilds.cache.size;
    
    console.log(`Bot foi iniciado, com ${totalUsers} usuários, em ${totalChannels} canais, em ${totalGuilds} servidores.`);
    client.user.setActivity(`Eu estou em ${totalGuilds} servidores`);
});

// Evento de mensagem
client.on('messageCreate', async message => {
    if (message.author.bot || message.channel.type === 'dm') return;
    
    if (!message.content.startsWith(config.prefix)) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);

    if (!command) return;

    try {
        await command.execute(message, args, client);
    } catch (error) {
        console.error(`Erro ao executar o comando ${commandName}:`, error);
        message.reply('Houve um erro ao executar o comando.');
    }
});

// Tratar erros globais
client.on('error', (error) => {
    console.error('Erro no cliente Discord:', error);
});

// Login do bot
client.login(config.token);