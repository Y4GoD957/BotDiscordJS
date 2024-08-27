import { Client, GatewayIntentBits, Collection } from 'discord.js';
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