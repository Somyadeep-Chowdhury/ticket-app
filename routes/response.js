var express = require('express');
var router = express.Router();
var ibmdb = require('ibm_db');
const dotenv = require('dotenv');
const { auditLogs } = require('./common-function');
dotenv.config();


//for local connection string
const dsn = 'DATABASE=' + process.env.DATABASE + ';HOSTNAME=' + process.env.HOSTNAME + ';PORT=' + process.env.DB_PORT + ';PROTOCOL=' + process.env.PROTOCOL + ';UID=' + process.env.USERNAMES + ';PWD=' + process.env.PASSWORD + ';Security=' + process.env.Security + ';SSLServerCertificate=' + process.env.certificate + ';';

var conn = ibmdb.openSync(dsn);


//updating the record
router.post('/api/v1/response', function (req, res) {
    ibmdb.open(dsn, function (err, conn) {
        var response_deatils = req.body
        var btnval = response_deatils.btnval
        var response_query;
        var tat_date = new Date(response_deatils.date);
        if (response_deatils.ticketStatus === "Open" || response_deatils.ticketStatus === "WIP" || response_deatils.btnval === "reply&close") {
            var dueDay = response_deatils.date
        }
        else {
            var date = tat_date.getDate();
            if (date <= 9) {
                date = '0' + date;
            }
            var month = tat_date.getMonth() + 1;
            if (month <= 9) {
                month = '0' + month;
            }
            var year = tat_date.getFullYear();
            var hour = tat_date.getHours();
            var min = tat_date.getMinutes();
            // var sec = tat_date.getSeconds()
            dueDay = date + '-' + month + '-' + year + " " + hour + ':' + min;
        }
        var resp_date = new Date(response_deatils.current_date);
        var day = resp_date.getDate();
        if (day <= 9) {
            day = '0' + day;
        }
        var mon = resp_date.getMonth() + 1;
        if (mon <= 9) {
            mon = '0' + mon;
        }
        // var hr = resp_date.getMonth() + 1;
        // if (hr <= 9) {
        //   hr = '0' + hr;
        // }
        var minu = resp_date.getMinutes();
        if (minu <= 9) {
            minu = '0' + minu;
        }
        // var secs = resp_date.getSeconds();
        // if (secs <= 9) {
        //   secs = '0' + secs;
        // }
        var yyyy = resp_date.getFullYear();
        var hr = resp_date.getHours();
        // var minu = resp_date.getMinutes();
        // var secs = resp_date.getSeconds()
        var cuurent_date = day + '-' + mon + '-' + yyyy + " " + hr + ':' + minu;
        // if (response_deatils.role === 'SME') {
        if (response_deatils.update === "sme") {
            response_query = "INSERT INTO " + process.env.RESPONSE_TABLE + " (TICKET_NO ,RESPONSE_DATE ,CLOSE_DATE ,PLAN ,ACTION ,STATUS ,OWNER ,TAT,IMPACT,ROLE,ACTUAL_CLOSE_DATE,ACTUAL_TAT,RESPONSE,STAGE_NAME,INTERNAL_COMMENT,ISSUE_TAG)  VALUES ('" + response_deatils.recordId + "','" + cuurent_date + "','" + dueDay + "','" + response_deatils.preventionplan + "','" + response_deatils.action + "','" + response_deatils.status + "', '" + response_deatils.ownership + "','" + response_deatils.tat + "','" + response_deatils.issueimpact + "','" + response_deatils.role + "','" + response_deatils.newdate + "','" + response_deatils.newtat + "','" + response_deatils.userResponse + "','" + response_deatils.stagename + "','" + response_deatils.internalComments + "','" + response_deatils.issueTagging + "');"
        }
        else {
            response_query = "INSERT INTO " + process.env.RESPONSE_TABLE + " (TICKET_NO ,RESPONSE_DATE ,CLOSE_DATE ,STATUS ,OWNER ,TAT,ROLE,RESPONSE,STAGE_NAME)  VALUES ('" + response_deatils.recordId + "','" + cuurent_date + "','" + response_deatils.planned_close_date + "','" + response_deatils.status + "', '" + response_deatils.ownership + "','" + response_deatils.tat + "','" + response_deatils.role + "','" + response_deatils.userResponse + "','" + response_deatils.stagename + "');"
        }
        //conn.query("CREATE TABLE "+process.env.RESPONSE_TABLE+" (TICKET_NO varchar(255),RESPONSE_DATE varchar(255),CLOSE_DATE varchar(255),PLAN varchar(255),ACTION varchar(255), STATUS varchar(255),OWNER varchar(255),TAT varchar(255),IMPACT varchar(255));", function (err, data) {
        // conn.query("INSERT INTO "+process.env.USER_TABLE+" (EMP_NAME ,EMP_ID ,EMP_EMAIL ,ROLE) VALUES ('Suma Sree','0004K9744','vejonnal@in.ibm.com','SME');", function (err, data) {
        // conn.query("ALTER TABLE "+process.env.RESPONSE_TABLE+" ADD ROLE varchar(255);" , function (err, data) {
        // conn.query("DELETE FROM "+process.env.RESPONSE_TABLE+" WHERE TICKET_NO='972444';" , function (err, data) {
        conn.query(response_query, function (err, data) {
            // conn.query("INSERT INTO "+process.env.RESPONSE_TABLE+" (TICKET_NO ,RESPONSE_DATE ,CLOSE_DATE ,PLAN ,ACTION ,STATUS ,OWNER ,TAT,IMPACT,ROLE,ACTUAL_CLOSE_DATE,ACTUAL_TAT,RESPONSE)  VALUES ('" + response_deatils.recordId + "','" + cuurent_date + "','" + dueDay + "','" + response_deatils.preventionplan + "','" + response_deatils.action + "','" + response_deatils.status + "', '" + response_deatils.ownership + "','" + response_deatils.tat + "','" + response_deatils.issueimpact + "','" + response_deatils.role + "','" + response_deatils.newdate + "','" + response_deatils.newtat + "','" + response_deatils.userResponse + "');", function (err, data) {
            if (err) {
                auditLogs({ name: req.body.loggedinUser, email: req.body.loggedinEmail, status: false, event: "Response Triggered", action: "Error While Adding Response for Ticket No: " + response_deatils.recordId })
                return res.json({ success: -2, message: err });
            }
            else {
                conn.query("UPDATE " + process.env.INCIDENT_LIST + " SET STATUS = '" + response_deatils.status + "' WHERE TICKET_NO = '" + response_deatils.recordId + "';", function (err, updatedata) {
                    if (err) {
                        auditLogs({ name: req.body.loggedinUser, email: req.body.loggedinEmail, status: false, event: "Response Triggered", action: "Error While Adding Response for Ticket No: " + response_deatils.recordId })
                        return res.json({ success: -2, message: err });
                    }
                    else {
                        auditLogs({ name: req.body.loggedinUser, email: req.body.loggedinEmail, status: true, event: "Response Triggered", action: "New Response Added for Ticket No: " + response_deatils.recordId })
                        res.send({ data: updatedata, message: "Update response" });
                    }
                })
            }
        })
    })
})
module.exports = router;