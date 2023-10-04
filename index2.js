const WebSocket = require('ws');
const express = require('express');
const http = require('http');

const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Armazenar todas as conexões de clientes em um conjunto
const clients = new Set();


// Configurar o servidor HTTP
app.use(express.static('public'));

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));
app.post('/login', (req, res, next) => {
    res.json({ token: '123456' });
});

app.get('/', (req,res)=>{
  res.send('On Line p');
})

// Crie um mapa para armazenar as conexões dos clientes por ID
const clientConnections = new Map();

let teste = true;

// Lidar com conexões WebSocket
wss.on('connection', (ws) => {
  console.log('Cliente conectado');

 // Adicionar o cliente ao conjunto de clientes
 clients.add(ws);

 

if(teste == true){
  ws.send('desligarLed1');
  teste=false
}

  ws.on('message', (message) => {
    console.log(`Recebido: ${message}`);

    if(message == "miau"){
// Encaminhar a mensagem para todos os outros clientes conectados
for (const otherClient of clients) {
  if (otherClient !== ws && otherClient.readyState === WebSocket.OPEN) {
    //otherClient.send(message);
    otherClient.send('ligarLed1');
    
  }
}
    }



    if(message == "mia"){
      // Encaminhar a mensagem para todos os outros clientes conectados
      for (const otherClient of clients) {
        if (otherClient !== ws && otherClient.readyState === WebSocket.OPEN) {
          //otherClient.send(message);
          otherClient.send('desligarLed1');
          
        }
      }
          }
      





    if(message == "miau"){
 console.log("ahan");
 ws.send('desligarLed1');
     }
    
  });
});




server.listen(process.env.PORT || 3000, () => {
  console.log('Servidor WebSocket porta 3000');
});


// Função para atribuir um ID de cliente a uma conexão WebSocket
function assignClientId(ws, clientId) {
  ws.clientId = clientId;
  clientConnections.set(clientId, ws);
}

// Exemplo de como atribuir um ID de cliente a uma conexão WebSocket
// Isso pode ser chamado quando um cliente se conectar e fornecer seu ID
assignClientId(clientConnection, "OLA1");




/*
EXEMPLO DE CLIENT
var net = require('net');
var client = new net.Socket(); //Cria o socket do cliente
client.connect(3000, '127.0.0.1', function() { //Inicia o socket do cliente
    console.log('Conectado ao servidor');
    client.write('Olá servidor! De, Cliente.');
});
client.on('data', function(data) {
    console.log('Recebido: ' + data);
});


*/