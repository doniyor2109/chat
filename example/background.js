//chating width devtools page
// devtools page cann not recieve your message until it is openned
chat.send({to:SCRIPTS.DEVTOOLS,message:{letter:"hello to DEVTOOLS from BACKGROUND"}});
chat.recieveDevtools=function(message){
    console.log(m.letter);
};

//chating width content script
chat.send({to:SCRIPTS.CONTENT_SCRIPT,message:{letter:"hello to CONTENT_SCRIPT from BACKGROUND"}});
chat.recieveBackground=function(message){
    console.log(m.letter);
};
