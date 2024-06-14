import WhatsApp from 'whatsapp';

//import dotenv 
import 'dotenv/config';

// axios , expres , body-parser
import axios from 'axios';
import express from 'express';
import bodyParser from 'body-parser';

const app=express().use(bodyParser.json());

const token=process.env.CLOUD_API_ACCESS_TOKEN;
const mytoken=process.env.WEBHOOK_VERIFICATION_TOKEN;//prasath_token

app.listen(process.env.PORT,()=>{
    console.log("webhook is listening in port " + process.env.LISTENER_PORT );
});


// Your test sender phone number
// const wa = new WhatsApp( process.env.SENDER_NUMBER );

// // Enter the recipient phone number
// const recipient_number = process.env.WA_PHONE_NUMBER

// async function send_message()
// {
//     try{
//         const sent_text_message = wa.messages.text( { "body" : "ready" }, recipient_number );

//         await sent_text_message.then( ( res ) =>
//         {
//             console.log( res.rawResponse() );
//         } );
//     }
//     catch( e )
//     {
//         console.log( JSON.stringify( e ) );
//     }
// }

// function custom_callback ( statusCode, headers, body, resp, err )
// {
//     console.log(
//         `Incoming webhook status code: ${ statusCode }\n\nHeaders:
//         ${ JSON.stringify( headers ) }\n\nBody: ${ JSON.stringify( body ) }`
//     );

//     if( resp )
//     {
//         resp.writeHead(200, { "Content-Type": "text/plain" });
//         resp.end();
//     }

//     if( err )
//     {
//         console.log( `ERROR: ${ err }` );
//     }
// }

// wa.webhooks.start( custom_callback );

// send_message();


//to verify the callback url from dashboard side - cloud api side
app.get("/webhook",(req,res)=>{
    let mode=req.query["hub.mode"];
    let challange=req.query["hub.challenge"];
    let token=req.query["hub.verify_token"];
 
 
     if(mode && token){
 
         if(mode==="subscribe" && token===mytoken){
             res.status(200).send(challange);
         }else{
             res.status(403);
         }
 
     }
 
 });
 
 app.post("/webhook",(req,res)=>{ //i want some 
 
     let body_param=req.body;
 
     console.log(JSON.stringify(body_param,null,2));
 
     if(body_param.object){
         console.log("inside body param");
         if(body_param.entry && 
             body_param.entry[0].changes && 
             body_param.entry[0].changes[0].value.messages && 
             body_param.entry[0].changes[0].value.messages[0]  
             ){
                let phon_no_id=body_param.entry[0].changes[0].value.metadata.phone_number_id;
                let from = body_param.entry[0].changes[0].value.messages[0].from; 
                let msg_body = body_param.entry[0].changes[0].value.messages[0].text.body;
 
                console.log("phone number "+phon_no_id);
                console.log("from "+from);
                console.log("boady param "+msg_body);
 
                axios({
                    method:"POST",
                    url:"https://graph.facebook.com/v13.0/"+phon_no_id+"/messages?access_token="+token,
                    data:{
                        messaging_product:"whatsapp",
                        to:from,
                        text:{
                            body:"Hi.. I'm Prasath, your message is "+msg_body
                        }
                    },
                    headers:{
                        "Content-Type":"application/json"
                    }
 
                });
 
                res.sendStatus(200);
             }else{
                 res.sendStatus(404);
             }
 
     }
 
 });
 
 app.get("/",(req,res)=>{
     res.status(200).send("hello this is webhook setup");
 });