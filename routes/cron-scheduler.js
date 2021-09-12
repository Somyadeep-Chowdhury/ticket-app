var cron = require('node-cron');
const ibmdb = require('ibm_db');
const dotenv = require('dotenv');
const { auditLogs } = require('./common-function');
dotenv.config();
//for local connection string
const dsn = 'DATABASE=' + process.env.DATABASE + ';HOSTNAME=' + process.env.HOSTNAME + ';PORT=' + process.env.DB_PORT + ';PROTOCOL=' + process.env.PROTOCOL + ';UID=' + process.env.USERNAMES + ';PWD=' + process.env.PASSWORD + ';Security=' + process.env.Security + ';SSLServerCertificate=' + process.env.certificate + ';';

var conn = ibmdb.openSync(dsn);

exports.cronschedule = () => {
    //  0 0-18/9 * * *
    //  * 0-23/12 * * *
    cron.schedule('0 0-18/9 * * *', async () => {
        try {
            let qry_ud = "SELECT * FROM " + process.env.USER_DB;
            let qry_ut = "SELECT * FROM " + process.env.USER_TABLE;

            let udb = await conn.query(qry_ud)
            let utdb = await conn.query(qry_ut)

            try {
                let filterArray = await udb.filter(({ USER_ID: id1 }) => !utdb.some(({ EMP_EMAIL: id2 }) => id1 === id2));
                console.log("Cron Data to be inserted :" + filterArray.length)
                filterArray.length > 0 && conn.query("select max(UID) from " + process.env.USER_TABLE + "; ", (err, infor) => {
                    if (!err) {
                        var result = Object.values(infor[0]);
                        maxData = result[0];

                        let query = "INSERT INTO " + process.env.USER_TABLE + " (UID, EMP_NAME, EMP_EMAIL, ROLE) VALUES";
                        var Args = [];
                        filterArray.forEach((user) => {
                            maxData++;
                            Args.push("(" + maxData + ", '" + user.USER_NAME + "', '" + user.USER_ID + "', 'User') ");
                        });
                        query += Args.join(", ");
                        // console.log(query)
                        conn.query(query, (err, data) => {
                            if (!err) {
                                auditLogs({ name: "", status: true, event: "Cron Scheduler", email: "", action: "Successfully added User through CronJon : " + filterArray.length })
                                console.log("Successfully added User through CronJon");
                            }
                            else {
                                auditLogs({ name: "", status: false, event: "Cron Scheduler", email: "", action: "Error at : 4: " + filterArray.length })
                                console.log("Error at : 4", err);
                            }
                        });
                    }
                    else {
                        auditLogs({ name: "", status: false, event: "Cron Scheduler", email: "", action: "Error at : 1: " + filterArray.length })
                        console.log("Error at : 1", err)
                    }
                });
            } catch (err) {
                auditLogs({ name: "", status: false, event: "Cron Scheduler", email: "", action: "Error at : 2" })
                console.log("Error at : 2", err)
            }

        } catch (err) {
            auditLogs({ name: "", status: false, event: "Cron Scheduler", email: "", action: "Error at : 3" })
            console.log("Error at : 3", err)
        }
    });
}