//chating width background
chat.send({to:SCRIPTS.BACKGROUND,message:{letter:"hello to BACKGROUND from DEVTOOLS"}});
chat.recieveBackground=function(message){
    console.log(m.letter);
};

//chating width content script
chat.send({to:SCRIPTS.CONTENT_SCRIPT,message:{letter:"hello to CONTENT_SCRIPT from DEVTOOLS"}});
chat.recieveContent=function(message){
    console.log(m.letter);
};
