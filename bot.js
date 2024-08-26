const { Client, GatewayIntentBits } = require('discord.js');
const jimp = require("jimp");
const toApng = require("gif-to-apng");
const download = require("download-file");
const fs = require('fs');
const path = require('path');

const config = require('./config.json');

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
    if (!canal) return console.error("Canal não encontrado");

    try {
        let fonte = await jimp.loadFont(jimp.FONT_SANS_32_BLACK);
        let mask = await jimp.read('img/mascara.png');
        let fundo = await jimp.read('img/fundo.png');

        let avatarURL = member.user.displayAvatarURL({ extension: 'png', dynamic: true, size: 512 });
        let avatar = await jimp.read(avatarURL);

        avatar.resize(130, 130);
        mask.resize(130, 130);
        avatar.mask(mask);

        fundo.print(fonte, 170, 175, member.user.username);
        fundo.composite(avatar, 40, 90);

        await fundo.writeAsync('bemvindo.png');
        await canal.send({ files: ["bemvindo.png"] });

        console.log('Imagem enviada para o Discord');
    } catch (err) {
        console.error('Erro ao processar a imagem:', err);
    }
});

client.on("guildCreate", guild => {
    console.log(`O bot entrou no servidor: ${guild.name} (id: ${guild.id}). População: ${guild.memberCount} membros!`);
    client.user.setActivity(`Estou em ${client.guilds.cache.size} servidores`);
});

client.on("guildDelete", guild => {
    console.log(`O bot foi removido do servidor: ${guild.name} (id: ${guild.id})`);
    client.user.setActivity(`Estou em ${client.guilds.cache.size} servidores`);
});

client.on("messageCreate", async message => {
    if (message.author.bot) return;
    if (message.channel.type === "dm") return;
    if (!message.content.startsWith(config.prefix)) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const comando = args.shift().toLowerCase();

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
});

client.login(config.token);