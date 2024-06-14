import WhatsApp from 'whatsapp'; // Verifica que este import es correcto y el paquete está instalado

// Importar dotenv
import 'dotenv/config';

// Importar axios, express y body-parser
import axios from 'axios';
import express from 'express';
import bodyParser from 'body-parser';

const app = express().use(bodyParser.json());

const token = process.env.CLOUD_API_ACCESS_TOKEN;
const mytoken = process.env.WEBHOOK_VERIFICATION_TOKEN;

// Escuchar en el puerto definido en las variables de entorno
app.listen(process.env.PORT, () => {
    console.log("Webhook is listening on port " + process.env.PORT);
});

// Configurar el webhook de verificación
app.get("/webhook", (req, res) => {
    let mode = req.query["hub.mode"];
    let challenge = req.query["hub.challenge"];
    let token = req.query["hub.verify_token"];

    if (mode && token) {
        if (mode === "subscribe" && token === mytoken) {
            res.status(200).send(challenge);
        } else {
            res.status(403).send('Forbidden');
        }
    }
});

// Manejar las solicitudes POST al webhook
app.post("/webhook", (req, res) => {
    let body_param = req.body;

    console.log(JSON.stringify(body_param, null, 2));

    if (body_param.object) {
        if (body_param.entry &&
            body_param.entry[0].changes &&
            body_param.entry[0].changes[0].value.messages &&
            body_param.entry[0].changes[0].value.messages[0]
        ) {
            let phone_no_id = body_param.entry[0].changes[0].value.metadata.phone_number_id;
            let from = body_param.entry[0].changes[0].value.messages[0].from;
            let msg_body = body_param.entry[0].changes[0].value.messages[0].text.body;

            console.log("Phone number ID: " + phone_no_id);
            console.log("From: " + from);
            console.log("Message body: " + msg_body);

            axios({
                method: "POST",
                url: `https://graph.facebook.com/v13.0/${phone_no_id}/messages?access_token=${token}`,
                data: {
                    messaging_product: "whatsapp",
                    to: from,
                    text: {
                        body: `Hi, I'm Prasath. Your message is: ${msg_body}`
                    }
                },
                headers: {
                    "Content-Type": "application/json"
                }
            })
            .then(response => {
                console.log(response.data);
                res.sendStatus(200);
            })
            .catch(error => {
                console.error(error);
                res.sendStatus(500);
            });
        } else {
            res.sendStatus(404);
        }
    }
});

// Ruta de prueba
app.get("/", (req, res) => {
    res.status(200).send("Hello, this is the webhook setup");
});
