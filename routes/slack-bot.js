// Require the Node Slack SDK package (github.com/slackapi/node-slack-sdk)
const { WebClient, LogLevel } = require("@slack/web-api");
const axios = require("axios");
const https = require("https");
const dotenv = require("dotenv");
dotenv.config();
// var express = require('express');
// var router = express.Router();

// WebClient insantiates a client that can call API methods
// When using Bolt, you can use either `app.client` or the `client` passed to listeners.
const client = new WebClient(process.env.SLACK_BOT_TOKEN, {
  // LogLevel can be imported and used to make debugging simpler
  logLevel: LogLevel.DEBUG,
});
// ID of the channel you want to send the message to
const channelId = process.env.SLACK_CPSD_SMATER_OPERATIONS_CHANNEL;

exports.slackPostMessage = async (conversationId, attachments) => {
  try {
    // Call the chat.postMessage method using the WebClient
    const result = await client.chat.postMessage({
      channel: conversationId,
      attachments: attachments
    });
    let obj = { status: true, data: result };
    return obj;
  } catch (error) {
    let obj = { status: false, data: error };
    return obj;
  }
};

exports.getSlackUserIdByEmail = async (email) => {
  try {
    // Call the users.lookupByEmail method using the WebClient to get user-id
    const result = await client.users.lookupByEmail({
      email: email,
    });
    let obj = { status: true, data: result.user.id };
    return obj;
  } catch (error) {
    let obj = { status: false, data: error };
    return obj;
  }
};

exports.openConversation = async (userId) => {
  try {
    // Call the conversations.open method using the WebClient to get user-id
    const result = await client.conversations.open({
      users: userId,
    });
    let obj = { status: true, data: result.channel.id };
    return obj;
  } catch (error) {
    let obj = { status: false, data: error };
    return obj;
  }
};

exports.closeConversation = async (conversationId) => {
  try {
    // Call the conversations.close method using the WebClient to get user-id
    const result = await client.conversations.close({
      channel: conversationId,
    });
    let obj = { status: true, data: result.ok };
    return obj;
  } catch (error) {
    let obj = { status: false, data: error };
    return obj;
  }
};

exports.sendSlackMessage = (users, subData) => {
  // console.log(users, "---------users")
  return new Promise((resolve, reject) => {
    var slackMessage;
    let x = [];
    users.length > 0 && users.forEach((user) => {
      x.push(user);
      this.getSlackUserIdByEmail(user).then(response => {
        if (response.status === true) {
          this.openConversation(response.data).then(response2 => {
            if (response2.status === true) {
              slackMessage = [{
                "color": "#36a64f",
                "pretext": "Notification Alert",
                "title": "Self Desk",
                "title_link": "https://cpssst-tool.dal1a.cirrus.ibm.com/#/",
                "text": "Hi <@" + response.data + ">,\nDescription: " + subData.description + "\nFor  support : https://cpssst-tool.dal1a.cirrus.ibm.com/#/ \n Do not reply.\n\n This is a system generated message.\nTeam – Smarter Operations",
                "fields": [{ "title": "Reason", "value": `${subData.subCategory} - ${subData.reason}`, "short": false }],
                "footer": "Self Desk",
                "ts": new Date().getTime()
              }]
              this.slackPostMessage(response2.data, slackMessage);
              if (x.length === users.length) {
                resolve("successfully sent messages");
              }
            }
          })
        }
      })
    })
  });
}


exports.sendMailSlackMessage = (users, message) => {
  // console.log(users, "---------users")
  return new Promise((resolve, reject) => {
    let x = [];
    users.length > 0 && users.forEach((user) => {
      x.push(user);
      this.getSlackUserIdByEmail(user).then(response => {
        if (response.status === true) {
          this.openConversation(response.data).then(response2 => {
            if (response2.status === true) {
              this.slackPostMessage(response2.data, message);
              if (x.length === users.length) {
                resolve("successfully sent messages");
              }
            }
          })
        }
      })
    })
  });
}
