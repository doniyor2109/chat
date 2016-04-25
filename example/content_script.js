//chating width devtools page
// devtools page cann not recieve your message until it is openned
chat.send({to:SCRIPTS.DEVTOOLS,message:{letter:"hello to DEVTOOLS from CONTENT_SCRIPT"}});
chat.recieveDevtools=function(message){
    console.log(m.letter);
};
//chating width background page
chat.send({to:SCRIPTS.BACKGROUND,message:{letter:"hello to BACKGROUND from CONTENT_SCRIPT"}});
chat.recieveBackground=function(message){
    console.log(m.letter);
};
