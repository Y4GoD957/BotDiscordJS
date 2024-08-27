import download from 'download-file';
import toApng from 'gif-to-apng';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
    name: 'apng',
    description: 'Converte GIF para APNG e cria um emoji.',
    async execute(message, args) {
        let [nome, emojilink] = args;
        if (!nome || !emojilink) {
            return message.reply("Uso: !apng <nome> <link.gif>");
        }

        let gifPath = path.join(__dirname, '..', 'img', 'emoji.gif');
        let apngPath = path.join(__dirname, '..', 'img', 'emoji.apng');

        download(emojilink, { directory: path.dirname(gifPath), filename: 'emoji.gif' }, async function (err) {
            if (err) {
                console.error('Erro ao baixar o GIF:', err);
                return message.channel.send("Erro ao baixar o GIF. Verifique o link.");
            }

            try {
                await toApng(gifPath, apngPath);
                if (fs.existsSync(apngPath)) {
                    await message.guild.emojis.create({ attachment: apngPath, name: nome });
                    await message.channel.send("O GIF-emoji foi convertido para o modo APNG e adicionado!!!");
                } else {
                    throw new Error("Arquivo APNG não encontrado após a conversão.");
                }
            } catch (error) {
                console.error('Erro ao converter a imagem:', error);
                message.channel.send("Não consegui converter a imagem para APNG.");
            }
        });
    }
};