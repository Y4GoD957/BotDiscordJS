import { Client, GatewayIntentBits } from 'discord.js';
import jimp from "jimp";
import toApng from "gif-to-apng";
import download from "download-file";
import fs from 'fs';
import path from 'path';
import { Low, JSONFile } from 'lowdb'; // banco de dados
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Usando fs para carregar o JSON
const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));

// Obtendo o caminho do diretório atual em ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuração do adaptador para JSON file
const adapter = new JSONFile(path.join(__dirname, 'discord-bank.json'));
const db = new Low(adapter);

// Função assíncrona para iniciar o banco de dados
async function initDB() {
    await db.read();
    db.data = db.data || {};  // Inicialize os dados se estiverem indefinidos
}

// Inicialize o banco de dados antes de usá-lo
await initDB();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ]
});

client.on("ready", async () => {
    await client.guilds.fetch();
    const totalUsers = client.users.cache.size;
    const totalChannels = client.channels.cache.size;
    const totalGuilds = client.guilds.cache.size;

    console.log(`Bot foi iniciado, com ${totalUsers} usuários, em ${totalChannels} canais, em ${totalGuilds} servidores.`);
    client.user.setActivity(`Eu estou em ${totalGuilds} servidores`);
});

client.on("guildMemberAdd", async member => {
    let canal = client.channels.cache.get("1277460591295860779");
    if (!canal) return console.error("Canal não encontrado"); // Verifica se o canal existe

    try {
        let fonte = await jimp.loadFont(jimp.FONT_SANS_32_BLACK);
        let mask = await jimp.read(path.join(__dirname, 'img', 'mascara.png'));
        let fundo = await jimp.read(path.join(__dirname, 'img', 'fundo.png'));

        let avatarURL = member.user.displayAvatarURL({ extension: 'png', dynamic: true, size: 512 });
        let avatar = await jimp.read(avatarURL);

        avatar.resize(130, 130);
        mask.resize(130, 130);
        avatar.mask(mask);

        fundo.print(fonte, 170, 175, member.user.username);
        fundo.composite(avatar, 40, 90);

        await fundo.writeAsync(path.join(__dirname, 'bemvindo.png'));
        await canal.send({ files: [path.join(__dirname, 'bemvindo.png')] });

        console.log('Imagem enviada para o Discord');
    } catch (err) {
        console.error('Erro ao processar a imagem:', err);
    }
});

client.on("guildCreate", async guild => {
    console.log(`O bot entrou no servidor: ${guild.name} (id: ${guild.id}). População: ${guild.memberCount} membros!`);
    client.user.setActivity(`Estou em ${client.guilds.cache.size} servidores`);

    await db.read();
    db.data[guild.id] = db.data[guild.id] || [];
    await db.write();
});

client.on("guildDelete", async guild => {
    console.log(`O bot foi removido do servidor: ${guild.name} (id: ${guild.id})`);
    client.user.setActivity(`Estou em ${client.guilds.cache.size} servidores`);
    
    await db.read();
    delete db.data[guild.id];
    await db.write();
});

client.on("messageCreate", async message => {
    if (message.author.bot) return;
    if (message.channel.type === "dm") return;
    if (!message.content.startsWith(config.prefix)) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const comando = args.shift().toLowerCase();

    // Garantir que os dados da guilda estejam inicializados
    await db.read();
    if (!db.data) {
        db.data = {}; // Inicializar db.data como objeto vazio se for null
    }

    if (!db.data[message.guild.id]) {
        db.data[message.guild.id] = [];
        await db.write();
    }

    if (comando === "ping") {
        const m = await message.channel.send("Ping?");
        setTimeout(() => {
            m.edit(`Pong! A Latência é ${m.createdTimestamp - message.createdTimestamp}ms. A Latência da API é ${Math.round(client.ws.ping)}ms`);
        }, 1000);
    }

    if (comando === "apng") {
        let [nome, emojilink] = args;
        if (!nome) return message.reply("Você esqueceu de definir o nome do emoji\n !apng <nome> <link.gif>");
        if (!emojilink) return message.reply("Você esqueceu de definir o link do GIF\n !apng <nome> <link.gif>");

        let gifPath = path.join(__dirname, 'img', 'emoji.gif');
        let apngPath = path.join(__dirname, 'img', 'emoji.apng');

        // Baixar o GIF
        download(emojilink, { directory: path.dirname(gifPath), filename: 'emoji.gif' }, async function (err) {
            if (err) {
                console.error('Erro ao baixar o GIF:', err);
                return message.channel.send("Erro ao baixar o GIF. Verifique o link.");
            }

            console.log("GIF identificado");

            try {
                // Converte o GIF para APNG
                await toApng(gifPath, apngPath);

                // Verifica se o arquivo APNG foi criado
                if (fs.existsSync(apngPath)) {
                    // Cria o emoji no servidor
                    await message.guild.emojis.create({
                        attachment: apngPath,
                        name: nome
                    });

                    await message.channel.send("O GIF-emoji foi convertido para o modo APNG e adicionado!!!");
                } else {
                    throw new Error("Arquivo APNG não encontrado após a conversão.");
                }
            } catch (error) {
                console.error('Erro ao converter a imagem💀:', error);
                message.channel.send("Não consegui converter a imagem para APNG.");
            }
        });
    }

    if (comando === "criar") {
        if (!db.data[message.guild.id]) {
            db.data[message.guild.id] = [];
        }
        db.data[message.guild.id].push({
            id: message.author.id,
            nick: message.author.username,
            avatar: message.author.displayAvatarURL()
        });
        await db.write();
        message.channel.send('Perfil criado com sucesso!');
    }

    if (comando === "editar") {
        if (!args[0]) {
            return message.channel.send('Você esqueceu de fornecer o novo nome!');
        }
        const [novonome] = args;

        const user = db.data[message.guild.id].find(user => user.id === message.author.id);
        if (user) {
            user.nick = novonome;
            await db.write();
            message.channel.send('Perfil editado com sucesso!');
        } else {
            message.channel.send('Usuário não encontrado!');
        }
    }

    if (comando === "apagar") {
        const index = db.data[message.guild.id].findIndex(user => user.id === message.author.id);
        if (index !== -1) {
            db.data[message.guild.id].splice(index, 1);
            await db.write();
            message.channel.send('Perfil apagado com sucesso!');
        } else {
            message.channel.send('Perfil não encontrado!');
        }
    }
});

// Adicionar tratamento de erro global
client.on('error', (error) => {
    console.error('Erro no cliente Discord:', error);
});

client.login(config.token);