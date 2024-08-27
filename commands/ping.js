export default {
    name: 'ping',
    description: 'Verifica a latência do bot.',
    async execute(message) {
        const m = await message.channel.send("Ping?");
        setTimeout(() => {
            m.edit(`Pong! A Latência é ${m.createdTimestamp - message.createdTimestamp}ms. A Latência da API é ${Math.round(message.client.ws.ping)}ms`);
        }, 1000);
    }
};