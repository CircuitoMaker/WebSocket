const WebSocket = require('ws');
const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Armazenar todas as conexões de clientes em um conjunto
const clients = new Set();


// Configurar o servidor HTTP
app.use(express.static('public'));


app.get('/', (req,res)=>{
  res.send('On Line p');
})


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




server.listen(443, () => {
  console.log('Servidor WebSocket rodando na porta 443');
});




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