const ibmdb = require('ibm_db');
const dotenv = require('dotenv');
dotenv.config();
//for local connection string
const dsn = 'DATABASE=' + process.env.DATABASE + ';HOSTNAME=' + process.env.HOSTNAME + ';PORT=' + process.env.DB_PORT + ';PROTOCOL=' + process.env.PROTOCOL + ';UID=' + process.env.USERNAMES + ';PWD=' + process.env.PASSWORD + ';Security=' + process.env.Security + ';SSLServerCertificate=' + process.env.certificate + ';';

var conn = ibmdb.openSync(dsn);
exports.auditLogs = (logData) => {
    console.log(logData, "ss")
    var date = new Date();
    var yy = date.getFullYear()
    var dt = date.getDate()
    var month = date.getMonth() + 1
    if (date < 10) {
        date = '0' + date
    }
    if (month < 10) {
        month = '0' + month
    }
    var todayDate = yy + "-" + month + "-" + dt
    let currTime = startTime();
    var aquery = "INSERT INTO " + process.env.AUDIT_TRAIL + " (USERNAME,USEREMAIL,ACTION_DATE,ACTION_TIME,ACTION,STATUS,EVENT) VALUES ('" + logData.name + "','" + logData.email + "','" + todayDate + "','" + currTime + "','" + logData.action + "','" + logData.status + "','" + logData.event + "')";
    // console.log(aquery)
    return new Promise(function (resolve, reject) {
        conn.query(aquery, (logErr, logResult) => {
            if (logErr) {
                console.log(logErr, "log error")
            }
            else {
                resolve("Log Added")
            }
        })
    })
}


// javascript time convertion
function checkTime(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}

function startTime() {
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    // add a zero in front of numbers<10
    m = checkTime(m);
    s = checkTime(s);
    return h + ":" + m + ":" + s;
}