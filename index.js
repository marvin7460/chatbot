import WhatsApp from 'whatsapp'; // Verifica que este import es correcto y el paquete está instalado

// Importar dotenv
import 'dotenv/config';

// Importar axios, express y body-parser
import express from 'express';
import bodyParser from 'body-parser';

const app = express().use(bodyParser.json());

const token = process.env.CLOUD_API_ACCESS_TOKEN;
const mytoken = process.env.WEBHOOK_VERIFICATION_TOKEN;


// Your test sender phone number
const wa = new WhatsApp( process.env.WA_PHONE_NUMBER_ID );

// Enter the recipient phone number
const recipient_number = process.env.WA_PHONE_NUMBER;

async function send_message()
{
    try{
        const sent_text_message = wa.messages.text( { "body" : "pong" }, recipient_number );

        await sent_text_message.then( ( res ) =>
        {
            console.log( 'pong');
        } );
    }
    catch( e )
    {
        console.log( JSON.stringify( e ) );
    }
}





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

            if(msg_body==='ping'){
                send_message();
            
            }
            res.sendStatus(200);
        } else {
            res.sendStatus(404);
        }
    }
});

// Ruta de prueba
app.get("/", (req, res) => {
    res.status(200).send("Hello, this is the webhook setup");
});
