var express = require('express');
var router = express.Router();
var ibmdb = require('ibm_db');
const dotenv = require('dotenv');
const { auditLogs } = require('./common-function');
dotenv.config();


//for local connection string
const dsn = 'DATABASE=' + process.env.DATABASE + ';HOSTNAME=' + process.env.HOSTNAME + ';PORT=' + process.env.DB_PORT + ';PROTOCOL=' + process.env.PROTOCOL + ';UID=' + process.env.USERNAMES + ';PWD=' + process.env.PASSWORD + ';Security=' + process.env.Security + ';SSLServerCertificate=' + process.env.certificate + ';';

var conn = ibmdb.openSync(dsn);

router.post('/api/v1/uploadExcel', function (req, res) {
  var result = req.body.data
  // console.log(result)
  result.forEach((e, i) => {
    // Iterate over the keys of object
    Object.keys(e).forEach((key) => {
      // Copy the value
      var val = e[key],
        newKey = key.replace(/\s+/g, "_");
      newKey = newKey.replace(/[&\/\\#,+()$~%.'":*?<>{}-]/g, '');
      newKey = newKey.toLowerCase()
      // Remove key-value from object
      delete result[i][key];
      // Add value with new key
      result[i][newKey] = val;
    });
  });
  // console.log(result, "ss")
  var filteredArrays = Object.values(result.reduce((acc, cur) => Object.assign(acc, { [cur.tribe_leader_email]: cur }), {}));
  // console.log(filteredArrays)
  var grouped1 = [];
  filteredArrays.forEach((record) => {
    if ((record.tribe_leader_email).includes("ibm.com")) {
      grouped1.push({
        EMP_NAME: record.tribe_leader,
        EMP_EMAIL: record.tribe_leader_email,
        ROLE: "User"
      })
    }
  })
  conn.query("SELECT * FROM " + process.env.USER_TABLE + "", (err, data) => {
    if (err) {
      return res.json({ success: -2, message: err });
    }
    else {
      if (data.length == 0) {
        // let query = "INSERT INTO CPSSO.USER_TABLE (EMP_NAME, EMP_EMAIL, ROLE) VALUES";
        let query = "INSERT INTO " + process.env.USER_TABLE + " (EMP_NAME,EMP_EMAIL,ROLE) VALUES";
        var Args = [];
        grouped1.forEach((user) => {
          Args.push("('" + user.EMP_NAME + "', '" + user.EMP_EMAIL + "', 'User') ");
        });
        query += Args.join(", ");
        conn.query(query, (err, data) => {
          auditLogs({ name: req.body.userData.loggedinUser, status: true, event: "UserList Upload", email: req.body.userData.email, action: "User List Uploaded Successfully" })
          res.send({ message: "File Uploaded Successfully" })
        });
      }
      else {
        //  UpdateUseList(grouped1,data);
        UpdateUseList(grouped1, data).then(function (response) {
          auditLogs({ name: req.body.userData.loggedinUser, status: true, event: "UserList Upload", email: req.body.userData.email, action: "User List Uploaded Successfully" })
          res.send({ message: response })
        }).catch(e=>{
          auditLogs({ name: req.body.userData.loggedinUser, status: false, event: "UserList Upload", email: req.body.userData.email, action: "User List Upload failed" })
          res.status(404).send({ message: "Network Error, Try Later" })
        })
      }
    }
  })
})

function UpdateUseList(grouped1, data) {
  var db_datas = [];
  var maxData
  const results = grouped1.filter(({ EMP_EMAIL: id1 }) => !data.some(({ EMP_EMAIL: id2 }) => id1 === id2));
  // console.log(results, "resulttttt")
  return new Promise(function (resolve, reject) {
    if (results.length == 0) {
      var response = "Everything is upto date"
      resolve(response);
    }
    else {
      conn.query("select max(UID) from " + process.env.USER_TABLE + "; ", (err, infor) => {
        if (!err) {
          var result = Object.values(infor[0]);
          maxData = result[0];
          // console.log(maxData, "maxData")
          if (!err) {
            let query = "INSERT INTO " + process.env.USER_TABLE + " (UID, EMP_NAME, EMP_EMAIL, ROLE) VALUES";
            var Args = [];
            results.forEach((user) => {
              maxData++;
              Args.push("(" + maxData + ", '" + user.EMP_NAME + "', '" + user.EMP_EMAIL + "', 'User') ");
            });
            query += Args.join(", ");
            conn.query(query, (err, data) => {
              if (!err) {
                var response = "File Uploaded Successfully"
                resolve(response)
              }
              else {
                resolve(err)
              }
            });
          }
          else {
            resolve(err)
          }
        }
        else {
          resolve(err)
        }
      });
    }
  })
}

module.exports = router;