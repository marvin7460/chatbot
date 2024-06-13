import WhatsApp from 'whatsapp';

//import dotenv 
import 'dotenv/config';



// Your test sender phone number
const wa = new WhatsApp( process.env.SENDER_NUMBER );

// Enter the recipient phone number
const recipient_number = process.env.WA_PHONE_NUMBER

async function send_message()
{
    try{
        const sent_text_message = wa.messages.text( { "body" : "ready" }, recipient_number );

        await sent_text_message.then( ( res ) =>
        {
            console.log( res.rawResponse() );
        } );
    }
    catch( e )
    {
        console.log( JSON.stringify( e ) );
    }
}

function custom_callback ( statusCode, headers, body, resp, err )
{
    console.log(
        `Incoming webhook status code: ${ statusCode }\n\nHeaders:
        ${ JSON.stringify( headers ) }\n\nBody: ${ JSON.stringify( body ) }`
    );

    if( resp )
    {
        resp.writeHead(200, { "Content-Type": "text/plain" });
        resp.end();
    }

    if( err )
    {
        console.log( `ERROR: ${ err }` );
    }
}

wa.webhooks.start( custom_callback );

send_message();