var express = require('express');
var router = express.Router();
var ibmdb = require('ibm_db');
const dotenv = require('dotenv');
const { auditLogs } = require('./common-function');
dotenv.config();


//for local connection string
const dsn = 'DATABASE=' + process.env.DATABASE + ';HOSTNAME=' + process.env.HOSTNAME + ';PORT=' + process.env.DB_PORT + ';PROTOCOL=' + process.env.PROTOCOL + ';UID=' + process.env.USERNAMES + ';PWD=' + process.env.PASSWORD + ';Security=' + process.env.Security + ';SSLServerCertificate=' + process.env.certificate + ';';

var conn = ibmdb.openSync(dsn);

//getting all issue types
router.get('/api/v1/getAllIssueTypes', function (req, res) {
    getAllIssueTypes()
        .then(output => {
            if (output.message === "Successfull") {
                res.status(200).send(output);
            } else {
                res.status(404).send({ success: -2, message: err })
            }
        }).catch(e => {
            res.status(404).send(e)
        })
})

function getAllIssueTypes() {
    return new Promise((resolve, reject) => {
        let qry = "SELECT * FROM " + process.env.ISSUE_TABLE
        ibmdb.open(dsn, function (err, conn) {
            conn.query(qry, function (err, data) {
                if (err) {
                    console.log(err)
                    reject({ success: -2, message: err });
                }
                else {
                    let arr = []
                    let a = data.map(item => item.ISSUE_TYPE).filter((value, index, self) => self.indexOf(value) === index).sort()
                    let b = []
                    let c = []
                    for (let i = 0; i < a.length; i++) {
                        b = data.filter((value, index, self) => value.ISSUE_TYPE === a[i]).map(item => item.ISSUE_CATEGORY).filter((value, index, self) => self.indexOf(value) === index).sort()
                        arr.push({ name: a[i], section: b, ticketType: [] })
                        for (let j = 0; j < b.length; j++) {
                            c = data.filter((value, index, self) => value.ISSUE_CATEGORY === b[j]).map(item => item.TICKET_TYPE).filter((value, index, self) => self.indexOf(value) === index).sort()
                            let ind = arr.findIndex(x => x.name === a[i])
                            let x = new Object()
                            x['section'] = b[j]
                            x['type'] = c
                            arr[ind].ticketType.push(x)
                        }
                    }
                    resolve({ data: arr, message: "Successfull" })
                }
            })
        })
    })
}

//adding issue
router.post('/api/v1/addIssue', function (req, res) {
    ibmdb.open(dsn, function (err, conn) {
        // console.log(req.body, "boddddyyyyydydydyd")
        var data = req.body;
        var val = req.body.val;
        var select_query;
        var update_query;
        let arr = [];
        if (val === "Update Category") {
            select_query = "SELECT * FROM " + process.env.ISSUE_TABLE + " WHERE ISSUE_TYPE=?;"

            arr = [data.issue]
        }
        else if (val === "Update Sub-Category") {
            select_query = "SELECT * FROM " + process.env.ISSUE_TABLE + " WHERE ISSUE_TYPE=? AND ISSUE_CATEGORY=?;"

            arr = [data.cat, data.sub_cat]
        }
        else if (val === "Update Ticket Type") {
            select_query = "SELECT * FROM " + process.env.ISSUE_TABLE + " WHERE ISSUE_TYPE=? AND ISSUE_CATEGORY=?AND TICKET_TYPE=?;"

            arr = [data.cat, data.sub_cat, data.ticket_type]
        }
        else {
            // select_query = "SELECT * FROM " + process.env.ISSUE_TABLE + " WHERE ISSUE_TYPE='" + data.issue + "' AND ISSUE_CATEGORY='" + data.category + "';"
            select_query = "SELECT * FROM " + process.env.ISSUE_TABLE + " WHERE ISSUE_TYPE=? AND ISSUE_CATEGORY=?AND TICKET_TYPE=?;"

            arr = [data.issue, data.category, data.ticketType]
        }
        conn.query(select_query, arr, function (err, selectData) {
            // console.log(err)
            // conn.query("SELECT * FROM "+process.env.ISSUE_TABLE+" WHERE ISSUE_TYPE='" + data.issue + "' AND ISSUE_CATEGORY='" + data.category + "';", function (err, selectData) {
            if (err) {
                auditLogs({ name: req.body.loggedinUser, email: req.body.email, status: false, event: "New Issue", action: "Error While Adding Issue" })
                return res.json({ success: -2, message: err });
            }
            else {
                if (selectData.length === 0) {
                    let qry = "INSERT INTO " + process.env.ISSUE_TABLE + " (ISSUE_TYPE,ISSUE_CATEGORY,TICKET_TYPE) VALUES(?,?,?);"
                    conn.query(qry, [req.body.issue, req.body.category, req.body.ticketType], function (err, datas) {
                        if (err) {
                            auditLogs({ name: req.body.loggedinUser, email: req.body.email, status: false, event: "New Issue", action: "Error While Adding Issue" })
                            return res.json({ success: -2, message: err });
                        }
                        else {
                            auditLogs({ name: req.body.loggedinUser, email: req.body.email, status: true, event: "New Issue", action: "Added Issue" })
                            res.send({ datas, message: "Added Successfully" });
                        }
                    })
                }
                else {
                    let inArr = []
                    if (val === "Update Category") {
                        update_query = "UPDATE " + process.env.ISSUE_TABLE + " SET ISSUE_TYPE =? WHERE ISSUE_TYPE =?;"

                        inArr = [req.body.category, req.body.issue]
                    }
                    else if (val === "Update Sub-Category") {
                        update_query = "UPDATE " + process.env.ISSUE_TABLE + " SET ISSUE_CATEGORY =? WHERE ISSUE_CATEGORY =? AND ISSUE_TYPE = ?;"

                        inArr = [req.body.new_sub_cat, req.body.sub_cat, req.body.cat]
                    }
                    else if (val === "Update Ticket Type") {
                        update_query = "UPDATE " + process.env.ISSUE_TABLE + " SET TICKET_TYPE =? WHERE TICKET_TYPE =? AND ISSUE_TYPE = ? AND ISSUE_CATEGORY =?;"

                        inArr = [req.body.new_ticket_type, req.body.sub_cat, req.body.cat, req.body.sub_cat]
                    }
                    // conn.query("UPDATE " + process.env.ISSUE_TABLE + " SET ISSUE_TYPE ='" + req.body.category + "'WHERE ISSUE_TYPE ='" + req.body.issue + "';", function (err, updatedData) {
                    conn.query(update_query, inArr, function (err, updatedData) {
                        if (err) {
                            auditLogs({ name: req.body.loggedinUser, email: req.body.email, status: false, event: "Update Issue", action: "Error While Updating Issue" })
                            return res.json({ success: -2, message: err });
                        }
                        else {
                            auditLogs({ name: req.body.loggedinUser, email: req.body.email, status: true, event: "Update Issue", action: "Updated Issue" })
                            res.send({ data: updatedData, message: "Updated Successfully" });
                        }
                    })
                }
            }
        })
    })
})

//deleting issue
router.post('/api/v1/DELETEISSUE', function (req, res) {
    ibmdb.open(dsn, function (err, conn) {
        // console.log(req.body)
        var delete_query;
        var data = req.body
        if (data.type === 'issue') {
            delete_query = "DELETE FROM " + process.env.ISSUE_TABLE + " WHERE ISSUE_TYPE=?;"
            conn.query(delete_query, [data.issue], function (err, data) {
                if (err) {
                    auditLogs({ name: req.body.loggedinUser, email: req.body.email, status: false, event: "Delete Issue", action: "Error While Deleting Issue" })
                    return res.json({ success: -2, message: err });
                }
                else {
                    auditLogs({ name: req.body.loggedinUser, email: req.body.email, status: true, event: "Delete Issue", action: "Issue Deleted for " + req.body.issue })
                    res.send({ data, message: "Deleted" });
                }
            })
        }
        else {
            delete_query = "DELETE FROM " + process.env.ISSUE_TABLE + " WHERE ISSUE_TYPE= ? AND ISSUE_CATEGORY = ?;"
            conn.query(delete_query, [data.issue, data.category], function (err, data) {
                if (err) {
                    auditLogs({ name: req.body.loggedinUser, email: req.body.email, status: false, event: "Delete Issue", action: "Error While Deleting Issue" })
                    return res.json({ success: -2, message: err });
                }
                else {
                    auditLogs({ name: req.body.loggedinUser, email: req.body.email, status: true, event: "Delete Issue", action: "Issue Deleted for " + req.body.issue + " - " + req.body.category })
                    res.send({ data, message: "Deleted" });
                }
            })
        }
    })
})

module.exports = router;