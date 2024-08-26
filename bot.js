const { Client, GatewayIntentBits } = require('discord.js');
const jimp = require("jimp");
const config = require('./config.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers, // Certifique-se de que esta intent está habilitada se precisar acessar membros
    ]
});

client.on("ready", async () => {
    // Atualizando cache antes de contar
    await client.guilds.fetch(); // Carrega todas as guildas
    const totalUsers = client.users.cache.size;
    const totalChannels = client.channels.cache.size;
    const totalGuilds = client.guilds.cache.size;

    console.log(`Bot foi iniciado, com ${totalUsers} usuários, em ${totalChannels} canais, em ${totalGuilds} servidores.`);
    client.user.setActivity(`Eu estou em ${totalGuilds} servidores`);
});

client.on("guildMemberAdd", async member => {
    let canal = client.channels.cache.get("1277460591295860779"); // Certifique-se de que o ID do canal está correto
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

        // Usar writeAsync para esperar a gravação do arquivo
        await fundo.writeAsync('bemvindo.png');

        // Enviar a imagem para o canal após ser completamente gravada
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

    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const comando = args.shift().toLowerCase();

    if (comando === "ping") {
        const m = await message.channel.send("Ping?");
        
        // Atrasar a edição da mensagem por 1 segundos (1000 milissegundos)
        setTimeout(() => {
            m.edit(`Pong! A Latência é ${m.createdTimestamp - message.createdTimestamp}ms. A Latência da API é ${Math.round(client.ws.ping)}ms`);
        }, 1000); // 1000 milissegundos = 1 segundos
    }
});

client.login(config.token);