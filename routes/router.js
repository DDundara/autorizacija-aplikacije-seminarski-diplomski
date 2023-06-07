const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');
const db = require('../lib/db.js');
const userMiddleware = require('../middleware/users.js');
router.post('sign-up', userMiddleware.validateRegister, (req, res, next) => {});
router.post('login', (req, res, next) => {});
// router.get('/secret-route', (req, res, next) => {
//   res.send('This is the secretees content. Only logged in users can see that!');
// });
module.exports = router;

router.post('/sign-up', userMiddleware.validateRegister, (req, res, next) => {
    console.log("Req1: "+req)
    const uname = req.body.username;
    const name = req.body.name;
    console.log("User name: "+uname)
    console.log("Real name: "+name)
    //db.query(`SELECT * FROM users WHERE LOWER(username) = LOWER($1)`,['uname'],
    db.query(`SELECT * FROM users WHERE LOWER(username) = $1`,[uname], (err, result) => {
        //console.log("Length0: "+result)
        console.log("Length1: "+result.rows.length)
        if (result.rows.length) {
          return res.status(409).send({
            msg: 'This username is already in use!'
          });
        } else {
          // username is available
          bcrypt.hash(req.body.password, 10, (err, hash) => {
            if (err) {
              return res.status(500).send({
                msg: err
              });
            } else {
              console.log("Ušao u else: ")
              // has hashed pw => add to database
              const usrname = req.body.username
              const usrrealname = req.body.name
              const usremail = req.body.email
              const usrspol = req.body.spol
              const usrgradid= req.body.gradid
              const usrgroupid= req.body.grupaid
              //const pass = req.body.password
              console.log("User name1: "+usrname)
              console.log("Real name1: "+usrrealname)
              console.log("Email1: "+usremail)
              console.log("Spol1: "+usrspol)
              console.log("grad1: "+usrgradid)
              console.log("grupa1: "+usrgroupid)
              //const { usrrealname,usrname} = request.body
              db.query(
                `INSERT INTO users (name,username,email,spol,gradid,groupid,password, registered,last_login) VALUES ( $1,$2,$3,$4,$5,$6, '${hash}', now(),now())`,[usrrealname,usrname,usremail,usrspol,usrgradid,usrgroupid],
                (err, result) => {
                  //console.log("Length3: "+result.length)
                  if (err) {
                    throw err;
                    // return res.status(400).send({
                    //   msg: err
                    // });
                  }
                  return res.status(201).send({
                    msg: 'Registered!'
                  });
                }
              );
            }
          });
        }
      }
    );
  });

  router.post('/login', (req, res, next) => {
    const uname = req.body.username;
    console.log("Uname2: "+uname)
    db.query(
      `SELECT u.id,u.username,u.groupid,u.password,ug.naziv FROM users u inner join usersgroups ug on u.groupid = ug.idgroup WHERE u.username = $1`,[uname],
      (err, result) => {
        // user does not exists
        if (err) {
          throw err;
          return res.status(400).send({
            msg: err
          });
        }
        console.log("Length2: "+result.rows.length)
        if (!result.rows.length) {
          return res.status(401).send({
            msg: 'Usernameee or password is incorrect!'
          });
        }
        // check password
        bcrypt.compare(
          req.body.password,
          result.rows[0]['password'],
          (bErr, bResult) => {
            // wrong password
            if (bErr) {
              throw bErr;
              return res.status(401).send({
                msg: 'Username or password is incorrect!'
              });
            }
            if (bResult) {
              const token = jwt.sign({
                  username: result.rows[0].username,
                  userId: result.rows[0].id,
                  userIdGroup: result.rows[0].groupid
                },
                'SECRETKEY', {
                  expiresIn: '7d'
                }
              );
              db.query(
                `UPDATE users SET last_login = now() WHERE id = '${result.rows[0].id}'`
              );
                const GrId = result.rows[0].groupid;
              db.query(`select ug.idgroup, ug.naziv from usersgroups ug where ug.idgroup = $1`,[GrId], (errs, results) => {
                console.log("Length3: "+results.rows.length)
                console.log("Grupa3: "+results.rows[0].naziv)
                if (errs) {
                  throw errs
                }
                //res.status(200).json(result.rows)
              })
              return res.status(200).send({
                msg: 'Logged in!',
                token,
                user: result.rows[0]
                //group: results.rows[0]
                //userIdGroup: result.rows[0].groupid
              });
              
            }
            return res.status(401).send({
              msg: 'Usernamee or password is incorrect!'
            });
          }
        );
      }
    );
  });

  router.get('/secret-route', (req, res, next) => {
    console.log(req.userData);
    res.send('This is the secrete content. Only logged in users can see that!');
  });

  router.get('/getallcities', (req, res, next) => {
    db.query(`select g.id, g.naziv from gradovi g`, (err, result) => {
      console.log("Length1: "+result.rows.length)
      console.log("Grad: "+result.rows[0].naziv)
      if (err) {
        throw err
      }
      res.status(200).json(result.rows)
    })
  });

  router.get('/getallgroups', (req, res, next) => {
    db.query(`select ug.idgroup, ug.naziv from usersgroups ug`, (err, result) => {
      console.log("Length1: "+result.rows.length)
      console.log("Grupa: "+result.rows[0].naziv)
      if (err) {
        throw err
      }
      res.status(200).json(result.rows)
    })
  });