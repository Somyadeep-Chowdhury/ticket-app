var express = require('express');
var router = express.Router();
var ibmdb = require('ibm_db');
const dotenv = require('dotenv');
const { auditLogs } = require('./common-function');
dotenv.config();

//for local connection string
const dsn = 'DATABASE=' + process.env.DATABASE + ';HOSTNAME=' + process.env.HOSTNAME + ';PORT=' + process.env.DB_PORT + ';PROTOCOL=' + process.env.PROTOCOL + ';UID=' + process.env.USERNAMES + ';PWD=' + process.env.PASSWORD + ';Security=' + process.env.Security + ';SSLServerCertificate=' + process.env.certificate + ';';

// var conn = ibmdb.openSync(dsn);

router.post('/api/v1/actionData', (req, res) => {
    let data = req.body;
    executeActionLog(data)
        .then(out => {
            auditLogs({ name: req.body.loggedinUser, status: true, event: "Log Download", email: req.body.email, action: "Log Downloaded from " + data.fromDate + " to " + data.toDate })
            res.status(200).send(out);
        })
        .catch(err => {
            console.log(err)
            auditLogs({ name: req.body.loggedinUser, email: req.body.email, status: false, event: "Log Download", action: "Error While Downloading Log" })
            res.status(404).send(err)
        })

})

function executeActionLog(objData) {
    return new Promise((resolve, reject) => {
        ibmdb.open(dsn, function (err, conn) {

            let qry = "SELECT USERNAME, USEREMAIL, ACTION, ACTION_DATE, ACTION_TIME, STATUS, EVENT FROM " + process.env.AUDIT_TRAIL + " WHERE ACTION_DATE >= ? AND ACTION_DATE <= ?";
            conn.query(qry, [objData.fromDate, objData.toDate], function (err, data) {
                if (err) {
                    reject({ success: -2, message: err });
                }
                else {
                    resolve({ data, message: "Action Log Retreived" });
                }
            })
        })
    })
}

module.exports = router;