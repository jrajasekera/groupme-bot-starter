'use strict';

require('dotenv').config();

const https = require('https');


class Bot {
    /**
     * Called when the bot receives a message.
     *
     * @static
     * @param {Object} message The message data incoming from GroupMe
     * @return {string}
     */
    static checkMessage(message) {
        const fromBot = message.sender_type == 'bot';
        const messageText = message.text;
        const sender = message.name

        if (!fromBot && sender == 'Andrew Altschuld') { //Andrew Altschuld
            return this.memeCapitalize(messageText)
        }

//        if (!fromBot && messageText) {
//            return this.spoonerize(messageText);
//        }

        return null;
    };

    static memeCapitalize(text) {
        const lowerCaseText = text.toLowerCase();
        let capital = false;
        let result = '';
        let i;
        for(i = 0; i < lowerCaseText.length; i++) {
            if(lowerCaseText[i].match(/[a-z]/i)) {
                // is letter
                if(capital) {
                    result += lowerCaseText[i].toUpperCase();
                } else {
                    result += lowerCaseText[i];
                }
                capital = !capital;
            } else {
                // non letter
                result += lowerCaseText[i];
            }
        }

        return result;
    }

    static spoonerize(text) {
        const minSpoonerWordLen = 3
        const tokens = text.split(" ")
        let prefixes = [];
        let result = '';
        let i;
        for (i = 0; i < tokens.length; i++) {
            if (tokens[i].length >= minSpoonerWordLen) {
                prefixes.push(tokens[i].charAt(0));
            }

        }

        // shuffle array
        this.shuffleArray(prefixes)

        for(i = 0; i < tokens.length; i++) {
            if(prefixes.length > 0 && tokens[i].length >= minSpoonerWordLen) {
                let lastElem = prefixes[prefixes.length - 1];
                if(lastElem == tokens[i].charAt(0)) {
                     this.swapLastTwoElements(prefixes)
                }
                result += prefixes.pop() + tokens[i].substring(1) + ' ';
            } else {
                result += tokens[i] + ' ';
            }
        }

        return result;
    }

    static swapLastTwoElements(array) {
        if(array.length > 1) {
            let first = array[array.length - 2]
            let last = array[array.length - 1]
            array[array.length - 2] = last
            array[array.length - 1] = first
        }
    }

    static shuffleArray(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }



    /**
     * Sends a message to GroupMe with a POST request.
     *
     * @static
     * @param {string} messageText A message to send to chat
     * @return {undefined}
     */
    static sendMessage(messageText) {
        // Get the GroupMe bot id saved in `.env`
        const botId = process.env.BOT_ID;

        const options = {
            hostname: 'api.groupme.com',
            path: '/v3/bots/post',
            method: 'POST'
        };

        const body = {
            bot_id: botId,
            text: messageText
        };

        // Make the POST request to GroupMe with the http module
        const botRequest = https.request(options, function(response) {
            if (response.statusCode !== 202) {
                console.log('Rejecting bad status code ' + response.statusCode);
            }
        });

        // On error
        botRequest.on('error', function(error) {
            console.log('Error posting message ' + JSON.stringify(error));
        });

        // On timeout
        botRequest.on('timeout', function(error) {
            console.log('Timeout posting message ' + JSON.stringify(error));
        });

        // Finally, send the body to GroupMe as a string
        botRequest.end(JSON.stringify(body));
    };
};

module.exports = Bot;
