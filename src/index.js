const WebSocket = require('ws');
const fs = require('fs');
const bd = require('./conexao');


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

try {
salvaBanco(data);
} catch (error) {
  console.log("erro " + error);
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


async function  salvaBanco(data){
  
  const {temp,umid} = data;

  const timestamp = new Date(); // Timestamp atual, você pode ajustar conforme necessário
  
  // Query para inserir os dados na tabela
  const query = 'INSERT INTO dados_temperatura_umidade (timestamp, temperatura, umidade) VALUES ($1, $2, $3)';
  
  // Executar a query para inserir os dados na tabela
  pool.query(query, [timestamp, temp, umid], (err, res) => {
    if (err) {
      console.error('Erro ao inserir os dados:', err);
    } else {
      console.log('Dados inseridos com sucesso na tabela!');
    }
    // Certifique-se de encerrar a conexão após as operações no banco de dados, se necessário
    pool.end();
    
  });
}
