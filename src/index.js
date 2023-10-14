const WebSocket = require('ws');
const fs = require('fs');

const server = new WebSocket.Server({ port: process.env.PORT || 3000 });

const groupData = {};
let masterClients = new Set();

server.on('connection', (ws) => {
  let user = null;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log(JSON.stringify(data, null, 2));

      const group = data.group;
      const id = data.id;
      user = data.user;
      const messageData = data.data;

      if (user === "master") {
        masterClients.add(ws);
        if (!groupData[group]) {
          groupData[group] = [];
        }
        console.log("recebido pelo master");
        groupData[group].push(data);

        //        fs.writeFileSync(`${group}.json`, JSON.stringify(groupData[group], null, 2));
        fs.writeFileSync(`${group}.json`, JSON.stringify(data, null, 2));
        console.log("recebido 2");
      } else {
        if (messageData === "sts") {
          if (groupData[group]) {
            // Lê o conteúdo do arquivo JSON do grupo
            const groupMessages = JSON.parse(fs.readFileSync(`${group}.json`, 'utf8'));
            console.log("MENSSAGEM DO GRUPO ");
            console.log(groupMessages);

            // Envie o conteúdo do arquivo JSON do grupo para todos os usuários
            server.clients.forEach((client) => {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(groupMessages));
              }
            });
          }
        } else {
          // Encaminhe a mensagem para o cliente "master" do grupo
          masterClients.forEach((masterClient) => {
            if (masterClient !== ws && masterClient.readyState === WebSocket.OPEN) {
              masterClient.send(JSON.stringify(data));
            }
          });
        }
      }
    } catch (error) {
      console.error('Erro ao processar a mensagem:', error);
    }
  });

  ws.on('close', () => {
    if (user === "master") {
      masterClients.delete(ws);
    }
  });
});

console.log('Servidor WebSocket em execução na porta 3000');
