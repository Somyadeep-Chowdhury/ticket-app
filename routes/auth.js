var express = require("express");
var router = express.Router();
var ldap = require("ldapjs");
var client = ldap.createClient({ url: "ldaps://bluepages.ibm.com:636" });
const axios = require("axios");
var ibmdb = require("ibm_db");
const dotenv = require("dotenv");
const { auditLogs } = require("./common-function");
dotenv.config();

//for local connection string
const dsn =
  "DATABASE=" +
  process.env.DATABASE +
  ";HOSTNAME=" +
  process.env.HOSTNAME +
  ";PORT=" +
  process.env.DB_PORT +
  ";PROTOCOL=" +
  process.env.PROTOCOL +
  ";UID=" +
  process.env.USERNAMES +
  ";PWD=" +
  process.env.PASSWORD +
  ";Security=" +
  process.env.Security +
  ";SSLServerCertificate=" +
  process.env.certificate +
  ";";

var conn = ibmdb.openSync(dsn);

// Create Base64 Object
const Base64 = {
  _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
  encode: function (e) {
    var t = "";
    var n, r, i, s, o, u, a;
    var f = 0;
    e = Base64._utf8_encode(e);
    while (f < e.length) {
      n = e.charCodeAt(f++);
      r = e.charCodeAt(f++);
      i = e.charCodeAt(f++);
      s = n >> 2;
      o = ((n & 3) << 4) | (r >> 4);
      u = ((r & 15) << 2) | (i >> 6);
      a = i & 63;
      if (isNaN(r)) {
        u = a = 64;
      } else if (isNaN(i)) {
        a = 64;
      }
      t =
        t +
        this._keyStr.charAt(s) +
        this._keyStr.charAt(o) +
        this._keyStr.charAt(u) +
        this._keyStr.charAt(a);
    }
    return t;
  },
  decode: function (e) {
    var t = "";
    var n, r, i;
    var s, o, u, a;
    var f = 0;
    e = e.replace(/[^A-Za-z0-9+/=]/g, "");
    while (f < e.length) {
      s = this._keyStr.indexOf(e.charAt(f++));
      o = this._keyStr.indexOf(e.charAt(f++));
      u = this._keyStr.indexOf(e.charAt(f++));
      a = this._keyStr.indexOf(e.charAt(f++));
      n = (s << 2) | (o >> 4);
      r = ((o & 15) << 4) | (u >> 2);
      i = ((u & 3) << 6) | a;
      t = t + String.fromCharCode(n);
      if (u != 64) {
        t = t + String.fromCharCode(r);
      }
      if (a != 64) {
        t = t + String.fromCharCode(i);
      }
    }
    t = Base64._utf8_decode(t);
    return t;
  },
  _utf8_encode: function (e) {
    e = e.replace(/rn/g, "n");
    var t = "";
    for (var n = 0; n < e.length; n++) {
      var r = e.charCodeAt(n);
      if (r < 128) {
        t += String.fromCharCode(r);
      } else if (r > 127 && r < 2048) {
        t += String.fromCharCode((r >> 6) | 192);
        t += String.fromCharCode((r & 63) | 128);
      } else {
        t += String.fromCharCode((r >> 12) | 224);
        t += String.fromCharCode(((r >> 6) & 63) | 128);
        t += String.fromCharCode((r & 63) | 128);
      }
    }
    return t;
  },
  _utf8_decode: function (e) {
    var t = "";
    var n = 0;
    var r = (c1 = c2 = 0);
    while (n < e.length) {
      r = e.charCodeAt(n);
      if (r < 128) {
        t += String.fromCharCode(r);
        n++;
      } else if (r > 191 && r < 224) {
        c2 = e.charCodeAt(n + 1);
        t += String.fromCharCode(((r & 31) << 6) | (c2 & 63));
        n += 2;
      } else {
        c2 = e.charCodeAt(n + 1);
        c3 = e.charCodeAt(n + 2);
        t += String.fromCharCode(
          ((r & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63)
        );
        n += 3;
      }
    }
    return t;
  },
};

/*Cheking user is a IBM User or Not  */
router.get("/login", function (req, res, next) {
  let intranet_id = req.query.email;
  let password = Base64.decode(req.query.pass);

  axios
    .get(
      "https://bluepages.ibm.com/BpHttpApisv3/slaphapi?ibmperson/(mail=" +
        intranet_id +
        ")/.list/byjson"
    )
    .then((response) => {
      let response_data = JSON.stringify(response.data);

      if (response.data.search.entry.length === 0) {
        auditLogs({
          name: "",
          email: intranet_id,
          status: false,
          event: "Login Attempt",
          action: " Login Attempt Failed due to Invalid email Id",
        });
        res.send({ isAuthenticated: false, message: "Invalid email Id" });
      } else {
        let uid = response.data.search.entry[0].dn;
        let username;
        let empId;
        for (
          var i = 0;
          i < response.data.search.entry[0].attribute.length;
          i++
        ) {
          if (response.data.search.entry[0].attribute[i].name === "cn") {
            username = response.data.search.entry[0].attribute[i].value[0];
          } else if (
            response.data.search.entry[0].attribute[i].name === "uid"
          ) {
            empId = response.data.search.entry[0].attribute[i].value[0];
          }
        }
        client.bind(uid, password, function (err) {
          if (err) {
            auditLogs({
              name: "",
              email: intranet_id,
              status: false,
              event: "Login Attempt",
              action: err.message,
            });
            res.send({ isAuthenticated: false, message: err.message });
          } else {
            auditLogs({
              name: username,
              email: intranet_id,
              status: true,
              event: "Login Attempt",
              action: "Successfully Authenticated",
            });
            res.send({
              isAuthenticated: true,
              message: "Enabale User Access",
              username: username,
              empId: empId,
            });
          }
        });
      }
    })
    .catch((error) => {
      auditLogs({
        name: "",
        email: intranet_id,
        status: false,
        event: "Login Attempt",
        action: "Network Error, Login Attempt Failed",
      });
      res
        .status(404)
        .send({ isAuthenticated: false, message: "Server Error, Try Later!" });
    });
});

router.post("/api/v1/checkUser", function (req, res) {
  var user = req.body.userId.toLowerCase();
  ibmdb.open(dsn, function (err, conn) {
    // conn.query("SELECT * FROM " + process.env.USER_TABLE + " WHERE EMP_EMAIL='" + user + "' ", (err, data) => {
    conn.query(
      "SELECT EMP_EMAIL,STAGE_NAME,ISSUE_CATEGORY,ISSUE_TYPE,EMP_NAME,ROLE,COUNT(*) AS COUNT FROM " +
        process.env.USER_TABLE +
        " WHERE EMP_EMAIL ='" +
        user +
        "' GROUP BY EMP_EMAIL,STAGE_NAME,ISSUE_CATEGORY,ISSUE_TYPE,EMP_NAME,ROLE",
      function (err, data) {
        if (err) {
          console.log(err, "errrorrr");
          auditLogs({
            name: "",
            email: user,
            status: false,
            event: "Portal Access",
            action: "Network Error, User not Authorised to Login",
          });
          return res.json({ success: -2, message: err });
        } else {
          console.log(data[0]);
          if (data[0] && data[0].COUNT == 1) {
            auditLogs({
              name: data[0].EMP_NAME,
              email: user,
              status: true,
              event: "Portal Access",
              action: "User Logged In as " + data[0].ROLE,
            });
            res.send({
              isAuthenticated: true,
              message: "Enabale User Access",
              username: data[0].EMP_NAME,
              role: data[0].ROLE,
              stagename: data[0].STAGE_NAME,
              section: data[0].ISSUE_CATEGORY,
              details: data,
            });
            var date = new Date();
            // conn.query("INSERT INTO " + process.env.AUDIT_TRAILS + " (EMAIL_ID,ROLE,TIME_STAMP) VALUES ('" + data[0].EMP_EMAIL + "','" + data[0].ROLE + "','" + date + "');", function (error, datas) {
            //   if (error) {
            //     return res.json({ success: -2, message: error });
            //   }
            //   else {
            //   }
            // })
          } else {
            auditLogs({
              name: "",
              email: user,
              status: false,
              event: "Portal Access",
              action: "User not Authorised to Login",
            });
            res.send({
              isAuthenticated: false,
              message:
                "You are not an authorised user.Please contact your manager",
            });
          }
        }
      }
    );
  });
});

router.post("/api/v1/getAllUsers", function (req, res) {
  ibmdb.open(dsn, function (err, conn) {
    var select_query;
    // select_query = "SELECT * FROM "+process.env.USER_TABLE+"";
    select_query = "SELECT * FROM " + process.env.USER_TABLE + "";
    conn.query(select_query, function (err, data) {
      if (err) {
        return res.json({ success: -2, message: err });
      } else {
        res.send({ data });
      }
    });
  });
});

router.post("/api/v1/getUserName", function (req, res) {
  let intranet_id = req.body.email;
  axios
    .get(
      "https://bluepages.ibm.com/BpHttpApisv3/slaphapi?ibmperson/(mail=" +
        intranet_id +
        ")/.list/byjson"
    )
    .then((response) => {
      let response_data = JSON.stringify(response.data);

      if (response.data.search.entry.length === 0) {
        res
          .status(200)
          .send({ name: "", message: "Invalid email id", status: false });
      } else {
        let userName = response.data.search.entry[0].attribute
          .filter((x) => x.name === "cn")
          .map((y) => y.value[0]);
        res.status(200).send({ name: userName[0], message: "", status: true });
      }
    })
    .catch((error) => {
      console.log(error);
      res
        .status(404)
        .send({
          isAuthenticated: false,
          message: "Server Error, Try Later!",
          status: false,
        });
    });
});

module.exports = router;
