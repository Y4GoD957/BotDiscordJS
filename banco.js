import { Low, JSONFile } from 'lowdb';

const adapter = new JSONFile('discord-bank.json');
const db = new Low(adapter);

// Criar
await db.read();
db.data ||= {};
db.data.servidor1 = [{
    id: "000000",
    nick: "Y4GoD",
    avatar: "link.com/avatar.png"
}];
db.data.servidor2 = [];
db.data.servidor3 = [];

// Postar
db.data.servidor1.push({
    id: "1111111",
    nick: "yago",
    avatar: "link.com/avatar.png"
});
await db.write();

// Editar
const item = db.data.servidor1.find(item => item.id === "1111111");
if (item) {
    item.nick = "yago new";
}

// Buscar
const valor = db.data.servidor1.find(item => item.id === "1111111");
console.log(valor);

// Apagar
db.data.servidor1 = db.data.servidor1.filter(item => item.id !== "1111111");