import jimp from 'jimp';
import path from 'path';

export default {
    name: 'guildMemberAdd',
    async execute(client, member) {
        const canal = client.channels.cache.get("1277460591295860779"); // ID do canal de boas-vindas
        if (!canal) return console.error("Canal não encontrado");

        try {
            const fonte = await jimp.loadFont(jimp.FONT_SANS_32_BLACK);
            const mask = await jimp.read(path.join('img', 'mascara.png'));
            const fundo = await jimp.read(path.join('img', 'fundo.png'));

            const avatarURL = member.user.displayAvatarURL({ extension: 'png', dynamic: true, size: 512 });
            const avatar = await jimp.read(avatarURL);

            avatar.resize(130, 130);
            mask.resize(130, 130);
            avatar.mask(mask);

            fundo.print(fonte, 170, 175, member.user.username);
            fundo.composite(avatar, 40, 90);

            await fundo.writeAsync(path.join('img', 'bemvindo.png'));
            await canal.send({ files: [path.join('img', 'bemvindo.png')] });

            console.log('Imagem enviada para o Discord');
        } catch (err) {
            console.error('Erro ao processar a imagem:', err);
        }
    }
};