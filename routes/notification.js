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


router.post('/api/v1/notificationMail', function (req, res) {
    try {
        var data = req.body.data;
        // var slackMessage;
        var subData = {
            category: data.category,
            subCategory: data.subCategory,
            reason: data.reason,
            description: data.description,
            geography: data.geography,
            user: data.user,
            selectedFile: data.selectedFile
        }
        // slackMessage = [{
        //     "color": "#36a64f",
        //     "pretext": "Notification Alert",
        //     "title": "Self Desk",
        //     "title_link": "https://cpssst-tool.dal1a.cirrus.ibm.com/#/",
        //     "text": "Description: " + subData.description + "\nFor  support : https://cpssst-tool.dal1a.cirrus.ibm.com/#/ \n Do not reply.\n\n This is a system generated message.\nTeam – Smarter Operations",
        //     "fields": [{ "title": "Reason", "value": `${subData.category} - ${subData.reason}`, "short": false }],
        //     "footer": "Self Desk",
        //     "ts": new Date().getTime()
        // }]
        if (data.type === "in") {
            console.log(data.userList.length)
            splitIntoChunks(data.userList, subData).then(data => {
                if (data === "success") {
                    notificationLogs(subData).then(out => {
                        if (out.length === 1) {
                            auditLogs({ name: req.body.data.loggedinUser, email: req.body.data.loggedinEmail, status: true, event: "Notification MAIL", action: "Notification Mail Sent for Category: " + req.body.data.category + " & Tools & Dashboard: " + req.body.data.subCategory + " & Reason: " + req.body.data.reason })
                            res.json({ data: "send" })
                        }
                        else {
                            auditLogs({ name: req.body.data.loggedinUser, email: req.body.data.loggedinEmail, status: false, event: "Notification MAIL", action: "Error While Sending Notification Mail for Category: " + req.body.data.category + " & Tools & Dashboard: " + req.body.data.subCategory + " & Reason: " + req.body.data.reason })
                            res.json({ data: "Something went wrong, Contact Service Provider!" })
                        }
                    })
                }
                else {
                    auditLogs({ name: req.body.data.loggedinUser, email: req.body.data.loggedinEmail, status: false, event: "Notification MAIL", action: "Error While Sending Notification Mail for Category: " + req.body.data.category + " & Tools & Dashboard: " + req.body.data.subCategory + " & Reason: " + req.body.data.reason })
                    res.json({ data: "Something went wrong, Contact Service Provider!" })
                }
            })
        } else if (data.type === "not_in") {
            let obj = {
                category: data.category,
                subCategory: data.subCategory,
                role: data.audience
            }
            getUserFromUSERDB(obj)
                .then(response => {
                    console.log(response, "users from db")
                    splitIntoChunks(['somycho1@in.ibm.com'], subData).then(data => {
                        // splitIntoChunks(response, subData).then(data => { //uncomment
                        if (data === "success") {
                            notificationLogs(subData).then(out => {
                                if (out.length === 1) {
                                    auditLogs({ name: req.body.data.loggedinUser, email: req.body.data.loggedinEmail, status: true, event: "Notification MAIL", action: "Notification Mail Sent for Category: " + req.body.data.category + " & Tools & Dashboard: " + req.body.data.subCategory + " & Reason: " + req.body.data.reason })
                                    res.json({ data: "send" })
                                }
                                else {
                                    auditLogs({ name: req.body.data.loggedinUser, email: req.body.data.loggedinEmail, status: false, event: "Notification MAIL", action: "Error While Sending Notification Mail for Category: " + req.body.data.category + " & Tools & Dashboard: " + req.body.data.subCategory + " & Reason: " + req.body.data.reason })
                                    res.json({ data: "Something went wrong, Contact Service Provider!" })
                                }
                            })
                        }
                        else {
                            auditLogs({ name: req.body.data.loggedinUser, email: req.body.data.loggedinEmail, status: false, event: "Notification MAIL", action: "Error While Sending Notification Mail for Category: " + req.body.data.category + " & Tools & Dashboard: " + req.body.data.subCategory + " & Reason: " + req.body.data.reason })
                            res.json({ data: "Something went wrong, Contact Service Provider!" })
                        }
                    })
                })
        }


    } catch (err) {
        auditLogs({ name: req.body.data.loggedinUser, email: req.body.data.loggedinEmail, status: false, event: "Notification MAIL", action: "Error While Sending Notification Mail for Category: " + req.body.data.category + " & Tools & Dashboard: " + req.body.data.subCategory + " & Reason: " + req.body.data.reason })
        console.log(err)
    }
});

//spliting records
async function splitIntoChunks(userData, data) {
    // console.log(userData, "split data")
    responsejson = [];
    var responseData;
    var length = userData.length;
    // console.log(length, "main length")
    var size;
    if (length < 10) {
        size = length
    } else if (length < 1000) {
        size = 0.10 * length;
    } else if (length < 10000) {
        size = 0.010 * length;
    } else {
        responseData = "Contact Service Provider"
    }
    var i = 0
    while (userData.length) {
        i++
        var pushrecord = userData.splice(0, size);
        await responsejson.push(
            mailFunction(pushrecord, data, i).then(function (myData) {
                responseData = myData
                return myData;
            }));
    }
    return responseData;
}

function mailFunction(uData, data, i) {
    var mail;
    if (i == 1) {
        // mail = 'adityarao@in.ibm.com'//for dev
        mail = ''//for local
    }
    else {
        mail = ''
    }
    // console.log(data.subCategory, "sub data")
    return new Promise(function (res, rej) {
        let transporter = nodemailer.createTransport({
            host: 'na.relay.ibm.com',
            port: 25,
            tls: { rejectUnauthorized: false }
        });
        uData.forEach(user => {
            let info = transporter.sendMail({
                from: 'CPS_SMARTER_OPERATION @in.ibm.com',// sender address   
                to: user, // list of receivers    
                cc: mail,
                // Subject line   
                subject: "Notification - " + (data.category !== "" ? data.category + " - " : '') + data.reason,
                html: 'Hi ' + user + ',<br/><br/> ' + data.description + ' <br/><br/>For  support <b> <a>https://cpssst-tool.dal1a.cirrus.ibm.com/#/</a></b >.</br ></br > <b>Do not reply. This is a system generated email.</b> </br ><p style="font-size:15px;">Team – Smarter Operations</p> ',
                attachments: data.selectedFile
            });
        })
        // res(uData)
        res("success")
    })
}

router.post('/api/v1/postNotification', (req, res) => {
    let data = req.body.data;
    // console.log(data)
    addNotification(data).then((out) => {
        if (out.length === 1) {
            notificationLogs(data).then(output => {
                if (output.length === 1) {
                    auditLogs({ name: req.body.data.loggedinUser, email: req.body.data.loggedinEmail, status: true, event: "New Notification", action: "Posted Notification for Category: " + req.body.data.category + " & Tools & Dashboard: " + req.body.data.subCategory + " & Reason: " + req.body.data.reason })
                    res.status(200).send({ data: out, message: "Successfully Inserted" })
                }
                else {
                    auditLogs({ name: req.body.data.loggedinUser, email: req.body.data.loggedinEmail, status: false, event: "New Notification", action: "Error While Adding Notification for Category: " + req.body.data.category + " & Tools & Dashboard: " + req.body.data.subCategory + " & Reason: " + req.body.data.reason })
                    res.status(404).send({ data: [], message: "Error, While Adding Notification" })
                }
            })
        } else {
            auditLogs({ name: req.body.data.loggedinUser, email: req.body.data.loggedinEmail, status: false, event: "New Notification", action: "Error While Adding Notification for Category: " + req.body.data.category + " & Tools & Dashboard: " + req.body.data.subCategory + " & Reason: " + req.body.data.reason })
            res.status(404).send({ data: [], message: "Error, While Adding Notification" })
        }
    }).catch((err) => {
        auditLogs({ name: req.body.data.loggedinUser, email: req.body.data.loggedinEmail, status: false, event: "New Notification", action: "Error While Adding Notification for Category: " + req.body.data.category + " & Tools & Dashboard: " + req.body.data.subCategory + " & Reason: " + req.body.data.reason })
        res.status(404).send({ data: [], message: "Error, While Adding Notification" })
    })
})

function addNotification(data) {
    return new Promise((resolve, reject) => {
        let sTime = startTime(data.start);
        let eTime = startTime(data.end);
        let add_query = "SELECT * FROM NEW TABLE (INSERT INTO " + process.env.NOTIFICATION_TABLE + " (ISSUE_TYPE,ISSUE_CATEGORY,REASONS,GEOGRAPHY,START_DATE,END_DATE,DESCRIPTION, START_TIME, END_TIME, UPDATED_BY, UPDATED_DATE) VALUES(?, ?, ?, ?, ?, ?, ?,?,?,?,?))"
        // console.log(add_query)
        console.log()
        conn.query(add_query, [data.category, data.subCategory, data.reason, data.geography, data.start.split('T')[0], data.end.split('T')[0], data.description, sTime, eTime, data.user, new Date().toISOString().split('T')[0]], function (err, response) {
            if (err) {
                console.log(err, "err")
                reject(err)
            }
            else {
                resolve(response)
            }
        });
    })
}

router.post('/api/v1/getPopNotification', (req, res) => {
    let data = req.body.data;
    // console.log(data)
    getPopNotification(data).then((out) => {
        if (out.length === 0) {
            res.status(200).send({ data: [], message: "Success", status: true })
        } else {
            res.status(200).send({ data: out, message: "Success", status: false })
        }
    }).catch((err) => {
        res.status(404).send({ data: [], message: "Error, While Fetching Notification", status: false })
    })
})

getPopNotification = (data) => {
    return new Promise((resolve, reject) => {
        let toDate = new Date();
        let currDate = toDate.toISOString();
        let searchQuery = "SELECT * FROM " + process.env.NOTIFICATION_TABLE + " WHERE START_DATE <= ? AND END_DATE >= ? AND ISSUE_TYPE = ?"
        // let searchQuery = "SELECT * FROM " + process.env.NOTIFICATION_TABLE + " WHERE START_DATE <= ? AND END_DATE >= ? AND START_TIME <= ? AND END_TIME >= ? AND ISSUE_TYPE = ?"
        console.log()
        conn.query(searchQuery, [currDate.split('T')[0], currDate.split('T')[0], data], function (err, response) {
            // conn.query(searchQuery, [currDate.split('T')[0], currDate.split('T')[0], currTime, currTime, data], function (err, response) {
            if (err) {
                console.log(err)
                reject(err)
            }
            else {
                let arr = [];
                response.length > 0 && response.forEach(x => {
                    let previousDate = new Date(x['START_DATE'] + " " + x['START_TIME'])
                    let futureDate = new Date(x['END_DATE'] + " " + x['END_TIME'])
                    if (previousDate <= toDate && futureDate >= toDate) {
                        arr.push(x);
                    }
                })
                resolve(arr)
            }
        });
    })
}

router.get('/api/v1/allNotification', (req, res) => {

    let fetchQuery = "SELECT * FROM " + process.env.NOTIFICATION_LOGS;
    conn.query(fetchQuery, function (err, response) {
        if (err) {
            console.log(err, "err")
            res.send({ data: [], message: "Error", status: false })
        }
        else {
            res.send({ data: response, message: "Success", status: true })
        }
    });
})

notificationLogs = (data) => {
    return new Promise((resolve, reject) => {
        // let currDate = new Date().toISOString().split('T')[0]
        let currDate = new Date().toISOString()
        let updatedBy = data.user
        // console.log(data, 'log')

        let notiLog = "SELECT * FROM NEW TABLE (INSERT INTO " + process.env.NOTIFICATION_LOGS + " (ISSUE_TYPE, ISSUE_CATEGORY, REASONS, GEOGRAPHY, DESCRIPTION, USER, DATE_TIME) VALUES (?,?,?,?,?,?,?))"
        console.log()
        conn.query(notiLog, [data.category, data.subCategory, data.reason, data.geography, data.description, updatedBy, currDate.split('T')[0]], function (err, response) {
            if (err) {
                console.log(err)
                reject(err)
            }
            else {
                resolve(response)
            }
        });
    })
}

// javascript time convertion
function checkTime(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}

function startTime(date) {
    var today = new Date(date);
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    // add a zero in front of numbers<10
    m = checkTime(m);
    s = checkTime(s);
    return h + ":" + m + ":" + s;
}

// getUserFromUSERDB = (obj) => {
//     return new Promise((resolve, reject) => {
//         try {
//             var select_query;
//             var select_arr;
//             if (obj.role === "SME") {
//                 select_query = "SELECT EMP_EMAIL FROM " + process.env.USER_TABLE + " WHERE ROLE = ? AND ISSUE_TYPE LIKE '%" + obj.category + "%' AND ISSUE_CATEGORY LIKE '%" + obj.subCategory + "%'";
//                 select_arr = [obj.role, obj.category, obj.subCategory]
//             } else if (obj.role === "Super User") {
//                 select_query = "SELECT EMP_EMAIL FROM " + process.env.USER_TABLE + " WHERE ROLE = ? AND ISSUE_TYPE LIKE '%" + obj.category + "%'";
//                 select_arr = [obj.role, obj.category]
//             } else {
//                 select_query = "SELECT USER_ID FROM " + process.env.USER_DB + " WHERE ROLE = ?";
//                 select_arr = [obj.role]
//             }
//             // console.log(select_query)
//             // console.log(select_arr)
//             ibmdb.open(dsn, function (err, conn) {
//                 conn.query(select_query, select_arr, function (err, data) {
//                     if (err) {
//                         resolve([])
//                     }
//                     else {
//                         if (data.length > 0) {
//                             let ul = [];
//                             ul = obj.role === "SME" || obj.role === "Super User" ? data.map(x => x.EMP_EMAIL) : data.map(x => x.USER_ID)
//                             resolve(ul)
//                         } else {
//                             resolve([])
//                         }
//                     }
//                 })
//             })
//         } catch (err) {
//             reject("Error")
//         }
//     })
// }

// getUserFromUSERDB = (obj) => {
function getUserFromUSERDB(obj) {
    return new Promise((resolve, reject) => {
        try {
            var select_query;
            var select_arr;
            let cat = obj.hasOwnProperty('category') ? "%" + obj.category + "%" : "%%";
            let subCat = obj.hasOwnProperty('subCategory') ? "%" + obj.subCategory + "%" : "%%";
            if (obj.role === "SME") {
                select_query = " SELECT   EMP_EMAIL   FROM   " + process.env.USER_TABLE + "   WHERE   ROLE =   ?   AND ISSUE_TYPE   LIKE   ?   AND   ISSUE_CATEGORY   LIKE   ?   "
            } else if (obj.role === "Super User") {
                select_query = "  SELECT EMP_EMAIL FROM " + process.env.USER_TABLE + " WHERE ROLE = ? AND ISSUE_TYPE LIKE ?  "
            } else {
                select_query = "SELECT USER_ID FROM " + process.env.USER_DB + " WHERE ROLE = ?"
            }
            console.log()
            // ibmdb.open(dsn, function (err, conn) {
            // var stmt = conn.prepareSync(select_query);
            // stmt.execute(select_arr, function (err, result) {
            //     if (err) {
            //         resolve([])
            //     } else {
            //         data = result.fetchAllSync();
            //         // console.log(data);
            //         if (data.length > 0) {
            //             let ul = [];
            //             ul = obj.role === "SME" || obj.role === "Super User" ? data.map(x => x.EMP_EMAIL) : data.map(x => x.USER_ID)
            //             resolve(ul)
            //         } else {
            //             resolve([])
            //         }
            //     }
            // })
            // })
            conn.query(select_query, [obj.role, cat, subCat], function (err, data) {
                if (err) {
                    console.log(err)
                    resolve([])
                }
                else {
                    if (data.length > 0) {
                        let ul = [];
                        ul = obj.role === "SME" || obj.role === "Super User" ? data.map(x => x.EMP_EMAIL) : data.map(x => x.USER_ID)
                        resolve(ul)
                    } else {
                        resolve([])
                    }
                }
            })
        } catch (err) {
            reject("Error")
        }
    })
}

router.post('/api/v1/slackNotification', function (req, res) {
    try {
        var data = req.body.data;
        // var slackMessage;
        var subData = {
            category: data.category,
            subCategory: data.subCategory,
            reason: data.reason,
            description: data.description,
            user: data.user,
            geography: data.geography,
        }
        // slackMessage = [{
        //     "color": "#36a64f",
        //     "pretext": "Notification Alert",
        //     "title": "Self Desk",
        //     "title_link": "https://cpssst-tool.dal1a.cirrus.ibm.com/#/",
        //     "text": "Description: " + subData.description + "\nFor  support : https://cpssst-tool.dal1a.cirrus.ibm.com/#/ \n Do not reply.\n\n This is a system generated message.\nTeam – Smarter Operations",
        //     "fields": [{ "title": "Reason", "value": `${subData.subCategory} - ${subData.reason}`, "short": false }],
        //     "footer": "Self Desk",
        //     "ts": new Date().getTime()
        // }]
        if (data.type === "in") {
            slackApi.sendSlackMessage(data.userList, subData);
            notificationLogs(subData).then(out => {
                if (out.length === 1) {
                    auditLogs({ name: req.body.data.loggedinUser, email: req.body.data.loggedinEmail, status: true, event: "Slack Notification", action: "Slack Notification Sent for Category: " + req.body.data.category + " & Tools & Dashboard: " + req.body.data.subCategory + " & Reason: " + req.body.data.reason })
                    res.json({ data: "send" })
                }
                else {
                    auditLogs({ name: req.body.data.loggedinUser, email: req.body.data.loggedinEmail, status: false, event: "Slack Notification", action: "Error While Sending Slack Notification for Category: " + req.body.data.category + " & Tools & Dashboard: " + req.body.data.subCategory + " & Reason: " + req.body.data.reason })
                    res.json({ data: "Something went wrong, Contact Service Provider!" })
                }
            })

        } else if (data.type === "not_in") {
            let obj = {
                category: data.category,
                subCategory: data.subCategory,
                role: data.audience
            }
            getUserFromUSERDB(obj)
                .then(response => {
                    console.log(response, "users from db")
                    // slackApi.sendSlackMessage(response, slackMessage); //uncomment
                    slackApi.sendSlackMessage(['somycho1@in.ibm.com'], subData).then(out => {
                        if (out === "successfully sent messages") {
                            notificationLogs(subData).then(out => {
                                if (out.length === 1) {
                                    auditLogs({ name: req.body.data.loggedinUser, email: req.body.data.loggedinEmail, status: true, event: "Slack Notification", action: "Slack Notification Sent for Category: " + req.body.data.category + " & Tools & Dashboard: " + req.body.data.subCategory + " & Reason: " + req.body.data.reason })
                                    res.json({ data: "send" })
                                }
                                else {
                                    auditLogs({ name: req.body.data.loggedinUser, email: req.body.data.loggedinEmail, status: false, event: "Slack Notification", action: "Error While Sending Slack Notification for Category: " + req.body.data.category + " & Tools & Dashboard: " + req.body.data.subCategory + " & Reason: " + req.body.data.reason })
                                    res.json({ data: "Something went wrong, Contact Service Provider!" })
                                }
                            })
                        } else {
                            auditLogs({ name: req.body.data.loggedinUser, email: req.body.data.loggedinEmail, status: false, event: "Slack Notification", action: "Error While Sending Slack Notification for Category: " + req.body.data.category + " & Tools & Dashboard: " + req.body.data.subCategory + " & Reason: " + req.body.data.reason })
                            res.json({ data: "Something went wrong, Contact Service Provider!" })
                        }
                    })
                })
        }
    } catch (err) {
        auditLogs({ name: req.body.data.loggedinUser, email: req.body.data.loggedinEmail, status: false, event: "Slack Notification", action: "Error While Sending Slack Notification for Category: " + req.body.data.category + " & Tools & Dashboard: " + req.body.data.subCategory + " & Reason: " + req.body.data.reason })
        console.log(err)
    }
});
module.exports = router;