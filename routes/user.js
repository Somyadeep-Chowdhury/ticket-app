var express = require('express');
var router = express.Router();
var ibmdb = require('ibm_db');
const dotenv = require('dotenv');
const { auditLogs } = require('./common-function');
dotenv.config();


//for local connection string
const dsn = 'DATABASE=' + process.env.DATABASE + ';HOSTNAME=' + process.env.HOSTNAME + ';PORT=' + process.env.DB_PORT + ';PROTOCOL=' + process.env.PROTOCOL + ';UID=' + process.env.USERNAMES + ';PWD=' + process.env.PASSWORD + ';Security=' + process.env.Security + ';SSLServerCertificate=' + process.env.certificate + ';';

var conn = ibmdb.openSync(dsn);

router.post('/api/v1/addUser', function (req, res) {
    var data = req.body;
    addUser(data)
        .then(response => {
            if (response.message === "Inserted") {
                auditLogs({ name: req.body.loggedinUser, email: req.body.loggedinEmail, status: true, event: "New User", action: "New User Added with mail-id: " + data.EMP_EMAIL })
                res.status(200).send(response)
            } else {
                auditLogs({ name: req.body.loggedinUser, email: req.body.loggedinEmail, status: false, event: "New User", action: "Error While Adding New User Added with mail-id: " + data.EMP_EMAIL })
                res.status(404).send({ data: [], message: "Contact Service Provider" })
            }
        })
        .catch((err) => {
            auditLogs({ name: req.body.loggedinUser, email: req.body.loggedinEmail, status: false, event: "New User", action: "Error While Adding New User Added with mail-id: " + data.EMP_EMAIL })
            res.status(404).send(err)
        })
})

function addUser(data) {
    return new Promise((resolve, reject) => {
        let qry = "INSERT INTO " + process.env.USER_TABLE + " (UID, EMP_NAME ,EMP_EMAIL ,ROLE,STAGE_NAME,ISSUE_TYPE,ISSUE_CATEGORY) VALUES (?,?,?,?,?,?,?)"
        console.log();
        conn.query(qry, [data.UID, data.EMP_NAME, data.EMP_EMAIL, data.ROLE, data.STAGE_NAME, data.ISSUE_TYPE, data.ISSUE_CATEGORY], function (err, data) {
            if (err) {
                reject({ success: -2, message: err });
            }
            else {
                resolve({ data: data, message: "Inserted" });
            }
        })
    })
}

router.post('/api/v1/updateUser', function (req, res) {
    ibmdb.open(dsn, function (err, conn) {
        var data = req.body
        let updateQuery = "UPDATE  " + process.env.USER_TABLE + "  SET EMP_NAME = ?,EMP_EMAIL = ?,ROLE= ?,STAGE_NAME= ?,ISSUE_TYPE= ?,ISSUE_CATEGORY= ? WHERE UID = ? AND EMP_EMAIL = ?;"
        // console.log(updateQuery)
        // console.log(data)
        conn.query(updateQuery, [data.EMP_NAME, data.EMP_EMAIL, data.ROLE, data.STAGE_NAME, data.ISSUE_TYPE, data.ISSUE_CATEGORY, data.UID, data.EMP_EMAIL], function (err, data) {
            if (err) {
                console.log(err)
                auditLogs({ name: req.body.loggedinUser, email: req.body.loggedinEmail, status: false, event: "Update User", action: "Error While Updation User with mail-id: " + req.body.EMP_EMAIL })
                res.status(404).json({ success: -2, message: err });
            }
            else {
                auditLogs({ name: req.body.loggedinUser, email: req.body.loggedinEmail, status: true, event: "Update User", action: "User Updated with mail-id: " + req.body.EMP_EMAIL })
                res.send({ data: data, message: "update user" });
            }
        })
    })
})

//Deleting User
router.post('/api/v1/deleteUser', function (req, res) {
    let mail = req.body.mail
    deleteUser(mail)
        .then(response => {
            if (response.message === "Deleted") {
                auditLogs({ name: req.body.loggedinUser, email: req.body.loggedinEmail, status: true, event: "Delete User", action: "User Deleted with mail-id: " + req.body.id })
                res.status(200).send(response)
            } else {
                auditLogs({ name: req.body.loggedinUser, email: req.body.loggedinEmail, status: false, event: "Delete User", action: "Error While Deleting User with mail-id: " + req.body.id })
                res.status(404).send({ data: [], message: "Contact Service Provider" })
            }
        })
        .catch((err) => {
            auditLogs({ name: req.body.loggedinUser, email: req.body.loggedinEmail, status: false, event: "Delete User", action: "Error While Deleting User with mail-id: " + req.body.id })
            res.status(404).send(err)
        })
})

function deleteUser(mail) {
    return new Promise((resolve, reject) => {
        ibmdb.open(dsn, function (err, conn) {

            let qry = "DELETE FROM " + process.env.USER_TABLE + " WHERE UID = ?;"
            conn.query(qry, [mail], function (err, data) {
                if (err) {
                    reject({ success: -2, message: err });
                }
                else {
                    resolve({ data, message: "Deleted" });
                }
            })
        })
    })
}

module.exports = router;