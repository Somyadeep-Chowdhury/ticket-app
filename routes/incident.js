var express = require('express');
var router = express.Router();
var ibmdb = require('ibm_db');
const dotenv = require('dotenv');
const { auditLogs } = require('./common-function');
dotenv.config();


//for local connection string
const dsn = 'DATABASE=' + process.env.DATABASE + ';HOSTNAME=' + process.env.HOSTNAME + ';PORT=' + process.env.DB_PORT + ';PROTOCOL=' + process.env.PROTOCOL + ';UID=' + process.env.USERNAMES + ';PWD=' + process.env.PASSWORD + ';Security=' + process.env.Security + ';SSLServerCertificate=' + process.env.certificate + ';';

var conn = ibmdb.openSync(dsn);


//Create Incident API
router.post('/api/v1/craeteIncident', function (req, res) {
    var issue_deatils = req.body
    // console.log(issue_deatils, "dfghjkl")
    ibmdb.open(dsn, function (err, conn) {
        var result = conn.querySync("SELECT * FROM NEW TABLE (INSERT INTO " + process.env.INCIDENT_LIST + " (TICKET_NO ,CREATED_DATE ,ISSUE_TYPE , NAME ,PRACTIONER ,CATEGORY ,DESCRIPTION ,SEVERITY ,SECTION,CREATED_FOR,STATUS,ACCOUNT_REPORT,SHARED_TICKET,TICKET_TYPE)  VALUES ('" + issue_deatils.recordId + "','" + issue_deatils.createdDate + "','" + issue_deatils.issuetype + "','" + issue_deatils.name + "','" + issue_deatils.practitioner + "','" + issue_deatils.category + "','" + issue_deatils.description + "','" + issue_deatils.severity + "','" + issue_deatils.section + "','" + issue_deatils.createFor + "','New','" + issue_deatils.accountreporting + "','" + issue_deatils.sharedInfo + "','" + issue_deatils.ticketType + "'));");
        // console.log(result, "resullll")
        if (result.length === 1) {
            auditLogs({ name: issue_deatils.loggedinUser, email: issue_deatils.loggedinEmail, status: true, event: "Raise Ticket", action: "Ticket Created with Ticket No: " + issue_deatils.recordId + " for Tools & Dashboard: " + issue_deatils.section })
            res.status(201).send({ data: result, message: "Successfully Inserted" });
        }
        else {
            auditLogs({ name: issue_deatils.loggedinUser, email: issue_deatils.loggedinEmail, status: false, event: "Raise Ticket", action: "Error While Creating Ticket with Tiket No: " + issue_deatils.recordId + " for Tools & Dashboard: " + issue_deatils.section })
            res.status(400).send({ data: [], message: "Error while Inseting data" });
        }
    })
})

//getAllIssues API
// previous
router.post('/api/v1/getAllIssues', function (req, res) {
    ibmdb.open(dsn, function (err, conn) {
        var created_for = (req.body.email).toLowerCase();
        var role = req.body.role;
        var randomval = req.body.data
        var category = req.body.category
        var b;
        if (category !== undefined) {
            b = "'" + category.split(",").join("','") + "'";
        }
        var select_query;
        if (randomval === "allissues") {
            select_query = "SELECT RT.CLOSE_DATE,RT.TAT,RT.OWNER, IL.TICKET_NO ,IL.CREATED_DATE ,IL.ISSUE_TYPE ,IL.NAME ,IL.PRACTIONER ,IL.CATEGORY ,IL.DESCRIPTION ,IL.SEVERITY ,IL.SECTION,IL.CREATED_FOR,IL.STATUS,IL.SHARED_TICKET,IL.TICKET_TYPE FROM " + process.env.INCIDENT_LIST + " IL LEFT JOIN " + process.env.RESPONSE_TABLE + " RT ON IL.TICKET_NO = RT.TICKET_NO WHERE SECTION IN (" + b + ") OR CREATED_FOR='" + created_for + "'";
        }
        else if (randomval === "getall") {
            select_query = "SELECT RT.CLOSE_DATE,RT.TAT,RT.OWNER, IL.TICKET_NO ,IL.CREATED_DATE ,IL.ISSUE_TYPE ,IL.NAME ,IL.PRACTIONER ,IL.CATEGORY ,IL.DESCRIPTION ,IL.SEVERITY ,IL.SECTION,IL.CREATED_FOR,IL.STATUS,IL.SHARED_TICKET,IL.TICKET_TYPE FROM " + process.env.INCIDENT_LIST + " IL LEFT JOIN " + process.env.RESPONSE_TABLE + " RT ON IL.TICKET_NO = RT.TICKET_NO";
        }
        else if (randomval === "mylog") {
            select_query = "SELECT RT.CLOSE_DATE,RT.TAT,RT.OWNER, IL.TICKET_NO ,IL.CREATED_DATE ,IL.ISSUE_TYPE ,IL.NAME ,IL.PRACTIONER ,IL.CATEGORY ,IL.DESCRIPTION ,IL.SEVERITY ,IL.SECTION,IL.CREATED_FOR,IL.STATUS,IL.SHARED_TICKET,IL.TICKET_TYPE FROM " + process.env.INCIDENT_LIST + " IL LEFT JOIN " + process.env.RESPONSE_TABLE + " RT ON IL.TICKET_NO = RT.TICKET_NO WHERE NAME = '" + created_for + "' OR PRACTIONER = '" + created_for + "'";
        }
        else if (randomval === "superuserissue") {
            select_query = "SELECT RT.CLOSE_DATE,RT.TAT,RT.OWNER, IL.TICKET_NO ,IL.CREATED_DATE ,IL.ISSUE_TYPE ,IL.NAME ,IL.PRACTIONER ,IL.CATEGORY ,IL.DESCRIPTION ,IL.SEVERITY ,IL.SECTION,IL.CREATED_FOR,IL.STATUS,IL.SHARED_TICKET,IL.TICKET_TYPE FROM " + process.env.INCIDENT_LIST + " IL LEFT JOIN " + process.env.RESPONSE_TABLE + " RT ON IL.TICKET_NO = RT.TICKET_NO WHERE ISSUE_TYPE IN (" + b + ")";
        }
        else {
            select_query = "SELECT RT.CLOSE_DATE,RT.TAT,RT.OWNER, IL.TICKET_NO ,IL.CREATED_DATE ,IL.ISSUE_TYPE ,IL.NAME ,IL.PRACTIONER ,IL.CATEGORY ,IL.DESCRIPTION ,IL.SEVERITY ,IL.SECTION,IL.CREATED_FOR,IL.STATUS,IL.SHARED_TICKET,IL.TICKET_TYPE FROM " + process.env.INCIDENT_LIST + " IL LEFT JOIN " + process.env.RESPONSE_TABLE + " RT ON IL.TICKET_NO = RT.TICKET_NO WHERE NAME = '" + created_for + "' OR PRACTIONER = '" + created_for + "'";
        }
        conn.query(select_query, function (err, datas) {
            if (err) {
                console.log(err, "errr")
                return res.json({ success: -2, message: err });
            }
            else {
                // console.log(datas.length, "dattsaaaaa")
                if (datas.length !== 0) {
                    var mainArr = Object.values(datas.reduce((acc, cur) => Object.assign(acc, { [cur.TICKET_NO]: cur }), {}));
                    var data = mainArr
                    res.send({ data })
                }
                else {
                    res.send({ data: [] })
                }
            }
        })
    })
})

//Getting updated record
router.post('/api/v1/getupdatedIssue', function (req, res) {
    ibmdb.open(dsn, function (err, conn) {
        var created_for = req.body.ticket
        var select_query;
        // select_query = "SELECT * FROM " + process.env.RESPONSE_TABLE + " WHERE TICKET_NO='" + created_for + "' ORDER BY " + process.env.RESPONSE_TABLE + ".RESPONSE_DATE DESC";
        select_query = "SELECT * FROM " + process.env.RESPONSE_TABLE + " WHERE TICKET_NO='" + created_for + "' ORDER BY TO_DATE(RESPONSE_DATE, 'DD-MM-YYYY HH24:MI') DESC";
        conn.query(select_query, function (err, data) {
            if (err) {
                return res.json({ success: -2, message: err });
            }
            else {
                res.send({ data });
            }
        })
    })
})

//Edit incident
router.post('/api/v1/editIncident', function (req, res) {
    var response_deatils = req.body
    ibmdb.open(dsn, function (err, conn) {
        conn.query("UPDATE " + process.env.INCIDENT_LIST + " SET TICKET_NO = '" + response_deatils.recordId + "',CREATED_DATE= '" + response_deatils.createdDate + "' ,ISSUE_TYPE= '" + response_deatils.issuetype + "' ,NAME = '" + response_deatils.name + "',PRACTIONER = '" + response_deatils.practitioner + "',CATEGORY = '" + response_deatils.category + "',DESCRIPTION = '" + response_deatils.description + "',SEVERITY = '" + response_deatils.severity + "',SECTION= '" + response_deatils.section + "',CREATED_FOR= '" + response_deatils.createFor + "',STATUS= '" + 'New' + "',ACCOUNT_REPORT= '" + response_deatils.accountreporting + "',SHARED_TICKET= '" + response_deatils.sharedInfo + "',TICKET_TYPE= '" + response_deatils.ticketType + "'WHERE TICKET_NO = '" + response_deatils.recordId + "';", function (err, data) {
            if (err) {
                // console.log("edit iffff")
                auditLogs({ name: response_deatils.loggedinUser, email: response_deatils.email, status: false, event: "Update Ticket", action: "Error While Updating  Ticket No: " + response_deatils.recordId })
                return res.json({ success: -2, message: err });
            }
            else {
                // console.log("edit else")
                auditLogs({ name: response_deatils.loggedinUser, email: response_deatils.email, status: true, event: "Update Ticket", action: "Ticket Updated for Ticket No: " + response_deatils.recordId })
                res.send({ data: data, message: "Edited" });
            }
        })
    })
})

//withdraw ticket
router.post('/api/v1/withdrawTicket', function (req, res) {
    var recordId = req.body.recordId
    withTicketFunction(recordId).then(out => {
        auditLogs({ name: req.body.loggedinUser, email: req.body.email, status: true, event: "WithDraw Ticket", action: "Ticket Withdraw for Ticket No: " + recordId })
        res.send(out)
    }).catch((err) => {
        auditLogs({ name: req.body.loggedinUser, email: req.body.email, status: false, event: "WithDraw Ticket", action: "Error While Withdrawing Ticket with Ticket No: " + recordId })
        res.status(404).send(err)
    })
})

function withTicketFunction(recordId) {
    return new Promise((res, rej) => {
        let qry = "DELETE FROM " + process.env.INCIDENT_LIST + " WHERE TICKET_NO= ?;"
        ibmdb.open(dsn, function (err, conn) {
            conn.query(qry, [recordId], function (err, data) {
                if (err) {
                    rej({ success: -2, message: err });
                }
                else {
                    res({ data: data, message: "Withdraw" });
                }
            })
        })
    })

}

//ticket transfer
router.post('/api/v1/ticketTransfer', function (req, res) {
    ibmdb.open(dsn, function (err, conn) {
        var response_deatils = req.body
        conn.query("UPDATE " + process.env.INCIDENT_LIST + " SET CREATED_FOR = '" + response_deatils.transferTo + "' WHERE TICKET_NO = '" + response_deatils.recordId + "';", function (err, data) {
            if (err) {
                auditLogs({ name: req.body.loggedinUser, email: req.body.email, status: false, event: "Transfer Ticket", action: "Error while transferring Ticket No: " + response_deatils.recordId })
                return res.json({ success: -2, message: err });
            }
            else {
                auditLogs({ name: req.body.loggedinUser, email: req.body.email, status: true, event: "Transfer Ticket", action: "Ticket transferred with Ticket No: " + response_deatils.recordId + " to " + response_deatils.transferTo })
                res.send({ data: data, message: "Transfered" });
            }
        })
    })
})
module.exports = router;