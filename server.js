const http = require('http');
const https = require('https');
const fs = require('fs');
const mime = require('mime-types');
const express = require('express');
const colors = require('colors');

const credentials = {
    key: fs.readFileSync('./security/server.key'),
    cert: fs.readFileSync('./security/server.crt')
};


const port = process.env.SERVER_PORT || 443;
const app = express();

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
});
app.use(express.static("public"));
app.use(express.json());



const users = [];
let signals = [];

app.post('/signal/:id', (req, res) => {
    const {type, receiver, content} = req.body;
    const {id} = req.params;

    if(type === 'offer' || type === 'answer') {
        signals = signals.filter(({sender, type}) => (sender !== id) || (type !== 'offer' && type !== 'answer'));
    }

    signals.push({
        sender: id,
        receiver,
        type,
        content
    });

    console.log(`new ${type} signal`.cyan.bold);
    console.log(`sender: ${id}`);
    console.log(`receiver: ${receiver}`);
    console.log(`${signals.length} signals`);
    signals.forEach(({sender, receiver, type}) => console.log(`${sender} ${receiver} ${type}`.gray));

    res.send({});
});

app.delete('/signal/:id', (req, res) => {
    const {type, receiver} = req.body;
    const {id} = req.params;

    signals = signals.filter(signal => (
        (signal.sender === id) &&
        (!receiver || signal.receiver === receiver) &&
        (!type || signal.type === type)
    ));
    res.send({});
});

app.post('/signal/:id/get', (req, res) => {
    const {id} = req.params;
    const {sender: filterSender} = req.body;


    res.send(signals.filter(({receiver, sender}) => (
        (!receiver || receiver === id)
        &&
        (!filterSender || sender === filterSender)
    )));

    filterSender && (signals = signals.filter(({receiver}) => receiver !== id));
});

app.post('/user', (req, res) => {
    const {id} = req.body;

    if(!users.find(user => user.id === id)) {
        users.push({id});

        console.log(`new user`.green.bold);
        console.log(`id: ${id}`);
        console.log(`${users.length} users online`);
    }

    res.send({});
});
app.get('/user', (req, res) => {
    res.send(users);
});

const httpsServer = https.createServer(credentials, app);

httpsServer.listen(port);

console.clear();
console.log(`Server Is Up On ${port}`.green.bold);
