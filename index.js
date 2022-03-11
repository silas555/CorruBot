const Discord = require('discord.js');
const fs = require('fs');
const net = require('net');
const client = new Discord.Client({ intents: ['GUILDS', 'GUILD_MESSAGES'] });

let token = "OTX2MDE5NTc0NjEyNTB$NDI1.Yc1hNQ.AWXDFDF1k2h_GK3lo4fj0%s36cvx"; // Insert your token here!

fs.readFile("options.ini", "utf8", (err, data) => {
    if (err) {
        console.error();
        return;
    }

    data = data.split("\r\n");

    //console.log(data[0].split('=')[1])

    ip = data[0].split("=")[1];
    port = data[1].split("=")[1];
});

clientSocket = null;

openConnection = function (timeout) {
    var timer;
    timeout = timeout || 2000;
    try {
       //console.log("[INFO] connecting to " + ip + ":" + port);
        clientSocket = new net.createConnection(port, ip)
            .on('connect', function () {
                clearTimeout(timer);
               console.log("[INFO] connected to " + ip + ":" + port)
            })
            .on('data', function () {
                clearTimeout(timer);
            })
            .on('error', function (err) {
                clearTimeout(timer);
                if (err.code == "ENOTFOUND") {
               //     console.log("[ERROR] No device found at this address!");
                    clientSocket = null;
                    timer = setTimeout(function () {
                        openConnection(2000);
                    }, 15000);
                    return;
                }

                if (err.code == "ECONNREFUSED") {
               //     console.log("[ERROR] Connection refused! Please check the IP.");
                    clientSocket = null;
                    timer = setTimeout(function () {
                        openConnection(2000);
                    }, 15000);
                    return;
                }


               // console.log("[CONNECTION] Unexpected error! " + err.message + " Connection Lost");
                console.log("[CONNECTION] disconnected!");
                clientSocket = null;
                timer = setTimeout(function () {
                    openConnection(2000);
                }, 15000);
            })
            .on('disconnect', function () {
                console.log("[CONNECTION] disconnected!");
                clientSocket = null;
                timer = setTimeout(function () {
                    openConnection(2000);
                }, 15000);
            });
        //       timer = setTimeout(function () {
        //        console.log("[ERROR] Attempt at connection exceeded timeout value");
        //       }, timeout);
    } catch (err) {
        clientSocket = null;
        //    console.log("[CONNECTION] connection failed! " + err);
    }
};

client.on('message', message => {
    if (!message.author.bot) {
        if (message.channel.name === 'bot') {
            if (message.content === '!help') { // Help Commands
                message.channel.send(
                    "**!help**\nZeigt die Commands an\n\n" +
                    "**!status**\nZeigt den Server-Status an\n\n" +
                    "**!messageSentBy**\nZeigt Sender an\n\n" +
                    "**---------------------------**\nServer Befehle\n**---------------------------**\n" +
                    //  "**!setTime [0-2400]**\nÄndert die Zeit in Stardew Valley\n\n" +
                    "**!setWallpaper [LINK]**\nSetzt das Hintergrundbild auf meinem PC\n\n"
                );
            }

            if (message.content === '!messageSentBy') {
                message.channel.send(message.author.username);
            }

            if (message.content === '!status') {
                if (clientSocket != null) {
                    message.channel.send("Server Status:```diff\n+Online\n```");
                } else {
                    message.channel.send("Server Status:```diff\n-Offline\n```");
                }
            }
            //Code Examples

            // ---------------------------------- Überprüft den Username und zeigt die Verbindung in der Console an
            //   if (message.content === '!adminTest' && message.author.username === 'Silas') {
            //       console.log(clientSocket);
            //   }
            //-----------------------------------

            // ---------------------------------- Register funktion, speichert emails in eine CSV Datei
            // if (message.content.includes('!register')) {
            //     var msg = message.content.split(" ")[1];
            //     if (msg != null)
            //         if (msg.includes('@') && msg.endsWith('.com') || msg.endsWith('.de')) {


            //             fs.appendFile('registerCSV.csv', msg + ";", err => {
            //                 if (err) {
            //                     console.err;
            //                 }
            //             });
            //             message.channel.send("Mail wurde erfolgreich registriert!\nDie Registration kann eine weile dauern.");
            //             message.channel.send(message.author.username + ":" + message.content.split(" ")[1]);
            //         } else {
            //             message.channel.send("Bitte gebe eine gültige Mail an\n");
            //         }
            // }
            //-----------------------------------

            //Client functions -- Server Status muss Online sein

            /*
            Die index.js ist der Discord bot der Befehle an einen C++ Server weitergibt.
            Hier unten wird nur bestimmt was an den Server weitergeben wird.
            */

            // ---------------------------------- Beispiel Server-Side Funktion -> Greift auf ein Spiel zu und ändert einen Wert
            // if (message.content.includes('!setTime')) {
            //     if (clientSocket == null) { message.channel.send("Server Status:```diff\n-Offline\n```"); return; }
            //     msg = parseInt(message.content.split(" ")[1]);
            //     if (Number.isInteger(msg) && msg >= 0 && msg <= 2400) {
            //         clientSocket.write('1:' + message.content.split(" ")[1]);
            //         message.channel.send("Uhrzeit wurde gesetzt");
            //     }
            //     else {
            //         message.channel.send("Bitte gebe eine Zahl zwischen 0-2400 ein.");
            //     }


            // }
            // ----------------------------------

            if (message.content.includes('!setWallpaper')) {
                if (clientSocket == null) { message.channel.send("Server Status:```diff\n-Offline\n```"); return; }
                if (message.content.endsWith('.jpg') || message.content.endsWith('.png') || message.content.endsWith('.jpeg')) {
                    clientSocket.write('2:' + message.content.split(" ")[1]);
                    message.channel.send("Wallpaper wurde gesetzt");
                }
                else {
                    message.channel.send("Kein gültiger link. Es sind nur Bilder mit den von typ JPG, PNG und JPEG erlaubt");
                }
            }

        }
    }
})

client.once('ready', () => {
    console.log('Ready!');
    openConnection(2000);
})

client.login(token);