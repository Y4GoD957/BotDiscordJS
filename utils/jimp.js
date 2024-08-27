import jimp from 'jimp';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Obtendo o caminho do diretório atual em ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function createImage() {
    let fonte = await jimp.loadFont(jimp.FONT_SANS_32_BLACK);
    let mask = await jimp.read(path.join(__dirname, '..', '..', 'img', 'mascara.png'));
    let fundo = await jimp.read(path.join(__dirname, '..', '..', 'img', 'fundo.png'));

    jimp.read('https://sm.ign.com/ign_br/news/a/avatar-the/avatar-the-last-airbender-is-getting-expansion-novels_sma8.jpg')
        .then(avatar => {
            avatar.resize(130, 130);
            mask.resize(130, 130);
            avatar.mask(mask);
            fundo.print(fonte, 170, 175, 'Yago Santos');
            fundo.composite(avatar, 40, 90).write(path.join(__dirname, '..', '..', 'img', 'beta.png'));
        })
        .catch(err => {
            console.error('Erro ao carregar a imagem:', err);
        });
}

export default createImage;