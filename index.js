const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const cors = require('cors');
const app = express();
const fs = require('fs');
const path = require('path');
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Armazenar as conexões dos clientes em um mapa
const clients = new Map();

// Quando uma conexão WebSocket é estabelecida
wss.on('connection', (ws) => {
  console.log('Cliente conectado.');

  // Quando uma mensagem é recebida
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      // Verifica se a mensagem contém uma ID
      if (data.id) {
        // Armazena a conexão com a ID do cliente
        clients.set(data.id, ws);
        console.log(`Cliente ${data.id} conectado.`);

        if (data.message == "sts") {
          const sourceClient =  clients.get(data.id);
          const caminhoArquivo = `${__dirname}/bancoDeDados/${data.to}.json`;
        
          if (fs.existsSync(caminhoArquivo)) {
            // Leia o conteúdo do arquivo JSON
            const conteudoArquivo = fs.readFileSync(caminhoArquivo, 'utf8');
        
            // Faça o parse do conteúdo JSON em um objeto JavaScript
            const objetoJSON = JSON.parse(conteudoArquivo);
        
            // Envie o objeto JSON como resposta
            sourceClient.send(JSON.stringify(objetoJSON));
          }
        }
        


        // Responde ao cliente com uma mensagem de confirmação
        ws.send(JSON.stringify({ message: `Olá, ${data.id}! Você está conectado.` }));
      } 
      
      if (data.to && data.message) {
        // Se a mensagem contém "to" e "message", envie a mensagem para o cliente de destino
        const targetClient = clients.get(data.to);
   
        const objetoParaEscrever = data.message


        // const objetoParaEscrever = {
        //   "rele1": "0",
        //   "rele2": "0",
        //   "rele3": "0",
        //   "rele4": "0",
        //   "rele5": "0" };

          // Nome do arquivo onde o objeto será escrito
const nomeDoArquivo = `${data.to}.json`;

// Converta o objeto para uma string JSON
const objetoJSON = JSON.stringify(objetoParaEscrever, null, 2);

// Escreva a string JSON no arquivo
fs.writeFile( path.join(__dirname +"/bancoDeDados", nomeDoArquivo), objetoJSON, (err) => {
  if (err) {
    console.error('Erro ao escrever o arquivo JSON:', err);
    return;
  }
});




//
if (data.to === data.id) {
 
    for (const client of clients.entries()) {
      console.log("Enviando mensagem para cliente: " + client[0]);
      client[1].send(JSON.stringify({ message: `${data.message}` }));
    }
  } else {
    if (targetClient) {
    //targetClient.send(JSON.stringify({ message: `${data.message}` }));
    targetClient.send(JSON.stringify(data.message));
  }}}
     
//

      
    } catch (error) {
      console.error('Erro ao processar a mensagem:', error);
    }
  });


  // Quando a conexão WebSocket é fechada
  ws.on('close', () => {
    for (const [id, client] of clients.entries()) {
      if (client === ws) {
        console.log(`Cliente ${id} desconectado.`);
        clients.delete(id);
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Servidor WebSocket está ouvindo na porta ${PORT}`);
});
