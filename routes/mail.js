var express = require('express');
var router = express.Router();
var ibmdb = require('ibm_db');
const dotenv = require('dotenv');
dotenv.config();
var nodemailer = require('nodemailer');
const { auditLogs } = require('./common-function');
const slackApi = require('./slack-bot')


//for local connection string
const dsn = 'DATABASE=' + process.env.DATABASE + ';HOSTNAME=' + process.env.HOSTNAME + ';PORT=' + process.env.DB_PORT + ';PROTOCOL=' + process.env.PROTOCOL + ';UID=' + process.env.USERNAMES + ';PWD=' + process.env.PASSWORD + ';Security=' + process.env.Security + ';SSLServerCertificate=' + process.env.certificate + ';';

var conn = ibmdb.openSync(dsn);


//mail to sme after ticket created
router.post('/api/v1/mailToSME', async function (req, res) {
    var data = req.body;
    var mailcontents = data.arr;
    var content;
    var slackMessage;
    let receipient = [];
    let sharedInfo = data.hasOwnProperty('sharedInfo') ? data.sharedInfo.split(',') : [];
    // console.log(sharedInfo)
    // console.log("SME", data)
    try {
        await ibmdb.open(dsn, function (err, conn) {
            conn.query("SELECT EMP_EMAIL FROM " + process.env.USER_TABLE + " WHERE ROLE = 'SME' AND ISSUE_CATEGORY LIKE '%" + data.section + "%' ;", async function (err, newResData) {
                // console.log(newResData.filter(e => e['EMP_EMAIL'].includes('@in.ibm.com')).map(f => f['EMP_EMAIL']))
                if (err) {
                    console.log(err)
                    auditLogs({ name: req.body.loggedinUser, email: req.body.loggedinEmail, status: false, event: "SME MAIL", action: "Error: " + err.message })
                    res.status(404).json({ data: "Error Occured, Try Later!" })
                }
                else if (newResData.length > 0) {
                    if (data.key === "Update") {
                        content = '<b>Hi SME,</b><br/> <br/><b>Ticket No: ' + data.recordId + ' updated with following details tagged to you</b><br/><br/>Date & Time : ' + data.createdDate + '<br/>Ticket No.: ' + data.recordId + '<br/>Issue Raised By : ' + data.type + '<br/>Issue Raised For : ' + data.practitioner + '<br/>Ticket Info shred with : ' + data.sharedInfo + '<br/>Priority: ' + data.severity + '<br/>Category: ' + data.issuetype + '<br/> Sub Category: ' + data.section + '<br/>Status:New<br/> Description : ' + data.description + '<br/><br/>View Ticket :<b> <a>https://cpssst-tool.dal1a.cirrus.ibm.com/#/</a></b >.</br ></br > This is a system generated message</br ></br > Team – Smarter Operations';

                        slackMessage = [{
                            "color": "#36a64f",
                            "pretext": 'Hi SME,\nTicket No:' + data.recordId + ' updated with following details tagged to you',
                            "title": "Self Desk",
                            "title_link": "https://cpssst-tool.dal1a.cirrus.ibm.com/#/",
                            "text": 'Date & Time : ' + data.createdDate + '\nTicket No.: ' + data.recordId + '\nIssue Raised By : ' + data.type + '\nIssue Raised For : ' + data.practitioner + '\nTicket Info shared with : ' + data.sharedInfo + '\nPriority: ' + data.severity + '\nCategory: ' + data.issuetype + '\n Sub Category: ' + data.section + '\nStatus: New\n Description : ' + data.description + '\nView Ticket : https://cpssst-tool.dal1a.cirrus.ibm.com/#/.\n\n This is a system generated message\n Team – Smarter Operations',
                            "fields": [{ "title": "Status", "value": "New", "short": false }],
                            "footer": "Self Desk",
                            "ts": new Date().getTime()
                        }]
                    }
                    else {
                        content = '<b>Hi SME,</b><br/> <br/><b>New ticket created with following details tagged to you</b><br/><br/>Date & Time :' + data.createdDate + '<br/>Ticket No.:' + data.recordId + '<br/>Issue Raised By : ' + data.type + '<br/>Issue Raised For : ' + data.practitioner + '<br/>Ticket Info shred with : ' + data.sharedInfo + '<br/>Priority:' + data.severity + '<br/>Category:' + data.issuetype + '<br/> Sub Category:' + data.section + '<br/>Status:New<br/> Description :' + data.description + '<br/><br/>View Ticket :<b> <a>https://cpssst-tool.dal1a.cirrus.ibm.com/#/</a></b >.</br ></br > This is a system generated message</br ></br > Team – Smarter Operations';

                        slackMessage = [
                            {
                                "color": "#36a64f",
                                "pretext": 'Hi SME,\nNew ticket created with following details tagged to you',
                                "title": "Self Desk",
                                "title_link": "https://cpssst-tool.dal1a.cirrus.ibm.com/#/",
                                "text": 'Date & Time :' + data.createdDate + '\nTicket No.:' + data.recordId + '\nIssue Raised By : ' + data.type + '\nIssue Raised For : ' + data.practitioner + '\nTicket Info shared with : ' + data.sharedInfo + '\nPriority:' + data.severity + '\nCategory:' + data.issuetype + '\n Sub Category:' + data.section + '\nStatus: New\n Description :' + data.description + '\nView Ticket :https://cpssst-tool.dal1a.cirrus.ibm.com/#/.\n\n This is a system generated message\n Team – Smarter Operation',
                                "fields": [{ "title": "Status", "value": "New", "short": false }],
                                "footer": "Self Desk",
                                "ts": new Date().getTime()
                            }
                        ]
                    }
                    receipient = newResData.filter(e => e['EMP_EMAIL'].includes('@in.ibm.com')).map(f => f['EMP_EMAIL'])
                    let transporter = await nodemailer.createTransport({
                        host: 'na.relay.ibm.com',
                        port: 25,
                        tls: { rejectUnauthorized: false }
                    });
                    let info = await transporter.sendMail({
                        from: 'CPS_CPSD_Insights_Ticketing_Tool@in.ibm.com',// sender address   
                        to: newResData.filter(e => e['EMP_EMAIL'].includes('@in.ibm.com')).map(f => f['EMP_EMAIL']), // list of receivers    
                        subject: "CPSD Self Service Ticketing Tool", // Subject line  
                        html: content,
                        cc: sharedInfo
                    });
                    slackApi.sendMailSlackMessage([...receipient, ...sharedInfo], slackMessage);
                    auditLogs({ name: req.body.loggedinUser, email: req.body.loggedinEmail, status: true, event: "SME MAIL", action: "Mail Sent To SME for Ticket No: " + data.recordId })
                    res.status(200).json({ data: "send" })
                } else {
                    auditLogs({ name: req.body.loggedinUser, email: req.body.loggedinEmail, status: false, event: "SME MAIL", action: "Error while sending mail To SME, SME Not Found" })
                    res.status(404).json({ data: "SME not found for " + data.section })
                }
            })
        })
    } catch (err) {
        console.log(err)
        auditLogs({ name: req.body.loggedinUser, email: req.body.loggedinEmail, status: false, event: "SME MAIL", action: "Error while sending mail To SME" })
        res.status(404).json({ data: "Error Occured, Try Later!" })
    }
});

// mail to user after ticket created
router.post('/api/v1/mailToUser', async (req, res) => {
    // console.log('hello')
    var data = req.body;
    var ccMail = data.name;
    var user = data.name.split('@')
    var mailcontents = [];
    var mail = [];
    // console.log(data, "mailToUSer")
    mailcontents.push(ccMail);
    if (data.name !== data.practitioner) {
        mailcontents.push(data.practitioner)
    }
    mail.push(data.sharedInfo)
    // else if (data.sharedInfo !== "") {
    //   mail = data.sharedInfo
    // }
    var content;
    var slackMessage;
    if (data.key === "Update") {
        content = '<b>Hi ,</b><br/> <br/><b>Ticket No:' + data.recordId + ' updated with following details</b><br/><br/>Date & Time : ' + data.createdDate + '<br/>Ticket No. : ' + data.recordId + '<br/>Issue Raised By : ' + data.type + '<br/>Issue Raised For : ' + data.practitioner + '<br/>Ticket Info shred with : ' + data.sharedInfo + '<br/>Priority : ' + data.severity + '<br/>Category : ' + data.issuetype + '<br/> Sub Category : ' + data.section + '<br/> Description : ' + data.description + '<br/><br/>View Ticket :<b> <a>https://cpssst-tool.dal1a.cirrus.ibm.com/#/</a></b >.</br ></br > This is a system generated message</br ></br > Team – Smarter Operations'

        slackMessage = [
            {
                "color": "#36a64f",
                "pretext": 'Hi ,\nTicket No:' + data.recordId + ' updated with following details',
                "title": "Self Desk",
                "title_link": "https://cpssst-tool.dal1a.cirrus.ibm.com/#/",
                "text": 'Date & Time : ' + data.createdDate + '\nTicket No. : ' + data.recordId + '\nIssue Raised By : ' + data.type + '\nIssue Raised For : ' + data.practitioner + '\nTicket Info shared with : ' + data.sharedInfo + '\nPriority : ' + data.severity + '\nCategory : ' + data.issuetype + '\nSub Category : ' + data.section + '\nDescription : ' + data.description + '\nView Ticket : https://cpssst-tool.dal1a.cirrus.ibm.com/#/.\n\n This is a system generated message\n Team – Smarter Operations',
                "fields": [{ "title": "Priority", "value": data.severity, "short": false }],
                "footer": "Self Desk",
                "ts": new Date().getTime()
            }
        ]
    }
    else {
        content = '<b>Hi ,</b><br/> <br/><b>New ticket created with following details</b><br/><br/>Date & Time : ' + data.createdDate + '<br/>Ticket No. : ' + data.recordId + '<br/>Issue Raised By : ' + data.type + '<br/>Issue Raised For : ' + data.practitioner + '<br/>Ticket Info shred with : ' + data.sharedInfo + '<br/>Priority : ' + data.severity + '<br/>Category : ' + data.issuetype + '<br/> Sub Category : ' + data.section + '<br/> Description : ' + data.description + '<br/><br/>View Ticket :<b> <a>https://cpssst-tool.dal1a.cirrus.ibm.com/#/</a></b >.</br ></br > This is a system generated message</br ></br > Team – Smarter Operations'

        slackMessage = [
            {
                "color": "#36a64f",
                "pretext": 'Hi ,\nNew ticket created with following details',
                "title": "Self Desk",
                "title_link": "https://cpssst-tool.dal1a.cirrus.ibm.com/#/",
                "text": 'Date & Time : ' + data.createdDate + '\nTicket No. : ' + data.recordId + '\nIssue Raised By : ' + data.type + '\nIssue Raised For : ' + data.practitioner + '\nTicket Info shared with : ' + data.sharedInfo + '\nPriority : ' + data.severity + '\nCategory : ' + data.issuetype + '\n Sub Category : ' + data.section + '\n Description : ' + data.description + '\nView Ticket : https://cpssst-tool.dal1a.cirrus.ibm.com/#/. \n\n This is a system generated message\n Team – Smarter Operations',
                "fields": [{ "title": "Priority", "value": data.severity, "short": false }],
                "footer": "Self Desk",
                "ts": new Date().getTime()
            }
        ]
    }
    let transporter = await nodemailer.createTransport({
        host: 'na.relay.ibm.com',
        port: 25,
        tls: { rejectUnauthorized: false }
    });
    let info = await transporter.sendMail({
        from: 'CPS_CPSD_Insights_Ticketing_Tool@in.ibm.com',// sender address   
        to: mailcontents, // list of receivers    
        cc: mail,
        subject: "CPSD Self Service Ticketing Tool", // Subject line    
        html: content
    });
    auditLogs({ name: req.body.loggedinUser, email: req.body.loggedinEmail, status: true, event: "USER MAIL", action: "Mail Sent To User for Ticket No: " + data.recordId })
    slackApi.sendMailSlackMessage([...mailcontents, ...mail], slackMessage);
    res.status(200).json({ data: "send" })
});

//mail to sme/user while replying
router.post('/api/v1/replyMail', async function (req, res) {
    var data = req.body;
    // console.log("data: ",data)
    var mailcontents = [data.owner];
    var slackMessage;
    var user = data.owner.split('@')
    var mail = [];
    if (data.owner !== data.practitioner) {
        mail.push(data.practitioner)
    }
    let transporter = await nodemailer.createTransport({
        host: 'na.relay.ibm.com',
        port: 25,
        tls: { rejectUnauthorized: false }
    });
    slackMessage = [
        {
            "color": "#36a64f",
            "pretext": 'Hi,\nChange in ticket status',
            "title": "Self Desk",
            "title_link": "https://cpssst-tool.dal1a.cirrus.ibm.com/#/",
            "text": 'Date & Time : ' + data.createdDate + '\nTicket No.: ' + data.recordId + '\nIssue Raised For : ' + data.practitioner + '\nTicket Info shared with : ' + data.sharedInfo + '\nPriority:' + data.severity + '\nCategory:' + data.issuetype + '\n Sub Category: ' + data.section + '\nStatus: ' + data.status + '\n Description : ' + data.userResponse + '\nView Ticket : https://cpssst-tool.dal1a.cirrus.ibm.com/#/.\n\n This is a system generated message\n Team – Smarter Operations',
            "fields": [{ "title": "Status", "value": data.status, "short": false }],
            "footer": "Self Desk",
            "ts": new Date().getTime()
        }
    ]
    let info = await transporter.sendMail({
        from: 'CPS_CPSD_Insights_Ticketing_Tool@in.ibm.com',// sender address   
        to: mailcontents, // list of receivers  
        cc: mail,
        subject: "CPSD Self Service Ticketing Tool", // Subject line    
        html: '<b>Hi ,</b><br/> <br/><b>Change in ticket status</b><br/><br/>Date & Time : ' + data.createdDate + '<br/>Ticket No.: ' + data.recordId + '<br/>Issue Raised For : ' + data.practitioner + '<br/>Ticket Info shared with : ' + data.sharedInfo + '<br/>Priority: ' + data.severity + '<br/>Category: ' + data.issuetype + '<br/> Sub Category: ' + data.section + '<br/>Status : ' + data.status + '<br/> Description :' + data.userResponse + '<br/><br/>View Ticket : <b> <a>https://cpssst-tool.dal1a.cirrus.ibm.com/#/</a></b >.</br ></br > This is a system generated message</br ></br > Team – Smarter Operations'
    });
    auditLogs({ name: req.body.loggedinUser, email: req.body.loggedinEmail, status: true, event: "Reply MAIL", action: "Reply Mail Sent with Ticket No: " + data.recordId + " and Status: " + data.status })

    slackApi.sendMailSlackMessage([...mailcontents, ...mail], slackMessage);
    res.json({ data: "Send" })
});

//mail to withdrawTicketMail to sme
router.post('/api/v1/withdrawTicketMail', async function (req, res) {
    var data = req.body;
    var slackMessage;
    // var mailcontents = data.arr;
    var mailcontents = []; //uncomment and test and check
    mailcontents.push(data.name)
    if (data.name !== data.practitioner) {
        mailcontents.push(data.practitioner)
    }
    let transporter = await nodemailer.createTransport({
        host: 'na.relay.ibm.com',
        port: 25,
        tls: { rejectUnauthorized: false }
    });
    slackMessage = [
        {
            "color": "#36a64f",
            "pretext": 'Hi,\nTicket has been withdrawn for Ticket No.:' + data.recordId,
            "title": "Self Desk",
            "title_link": "https://cpssst-tool.dal1a.cirrus.ibm.com/#/",
            "text": 'Issue Raised By : ' + data.type + '\nIssue Raised For : ' + data.practitioner + '\nTicket Info shared with : ' + data.sharedInfo + '\nPriority:' + data.severity + '\nCategory:' + data.issuetype + '\n Sub Category:' + data.section + '\nStatus : Closed\n Description :' + data.description + '\nView Ticket : https://cpssst-tool.dal1a.cirrus.ibm.com/#/.\n\n This is a system generated message\n Team – Smarter Operations',
            "fields": [{ "title": "Status", "value": "Closed", "short": false }],
            "footer": "Self Desk",
            "ts": new Date().getTime()
        }
    ]
    let info = await transporter.sendMail({
        from: 'CPS_CPSD_Insights_Ticketing_Tool@in.ibm.com',// sender address   
        to: mailcontents, // list of receivers    
        subject: "CPSD Self Service Ticketing Tool", // Subject line    
        html: '<b>Hi,</b><br/> <br/><b>Ticket has been withdrawn </b><br/><br/>Ticket No.:' + data.recordId + '<br/>Issue Raised By : ' + data.type + '<br/>Issue Raised For : ' + data.practitioner + '<br/>Ticket Info shred with : ' + data.sharedInfo + '<br/>Priority:' + data.severity + '<br/>Category:' + data.issuetype + '<br/> Sub Category:' + data.section + '<br/>Status:New<br/> Description :' + data.description + '<br/><br/>View Ticket :<b> <a>https://cpssst-tool.dal1a.cirrus.ibm.com/#/</a></b >.</br ></br > This is a system generated message</br ></br > Team – Smarter Operations'
    });
    auditLogs({ name: req.body.loggedinUser, email: req.body.loggedinEmail, status: true, event: "Withdraw MAIL", action: "Mail Sent for Withdrawing Ticket No: " + data.recordId })
    slackApi.sendMailSlackMessage(mailcontents, slackMessage);
    res.json({ data: "send" })
    // }
})


module.exports = router;