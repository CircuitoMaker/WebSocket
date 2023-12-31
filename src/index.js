const WebSocket = require('ws');
const fs = require('fs');
const pool = require('./conexao');
const express = require('express');
const app = express();
app.use(express.json());


// app.get('/dados', async (req, res) => {
//   try {
//     const query = `SELECT * FROM dados_temperatura_umidade`;
//     const resultado = await pool.query(query);
//     const rows = resultado.rows;

//     return res.json(rows); // Retorna os dados do banco como resposta
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: 'Erro ao buscar Dados' });
//   }
// });





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


            try {
              salvaBanco(groupMessages.data);
              } catch (error) {
                console.log("erro " + error);
              }


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


async function salvaBanco(data){
  
  const temp = data.temp;
  const umid = data.umid;
 
console.log("Dados de temperatura recebidos = " + temp);
console.log("Dados de umidade recebidos = " + umid);

  const timestamp = new Date(); // Timestamp atual, você pode ajustar conforme necessário
  
  try {
   // Query para inserir os dados na tabela
   const query = 'INSERT INTO dados_temperatura_umidade (timestamp, temperatura, umidade) VALUES ($1, $2, $3)';
  
    pool.query(query, [timestamp, temp, umid]);
    //pool.end();
  } catch (error) {
    console.log("erro de gravaçao ao BD " + error);
  }
}





