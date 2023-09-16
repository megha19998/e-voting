console.log('May Node be with you')
const express = require('express');
const bodyParser= require('body-parser')
const popup = require('node-popup');
const MongoClient = require('mongodb').MongoClient
const app = express();
const uri = "mongodb+srv://megha:##########@cluster0.jwioo.mongodb.net/megha?retryWrites=true&w=majority";
const nodemailer=require('nodemailer');
var otpGenerator = require('otp-generator')
const blockchain = require('./blockchain.js');
const { winner } = require('./blockchain.js');
var crypto = require('crypto');
var assert = require('assert');
// bcrypt = require('bcryptjs')
var algorithm = 'aes256'; // or any other algorithm supported by OpenSSL
var key = 'password';
var publicDir = require('path').join(__dirname,'/public'); 
app.use(express.static(publicDir)); 
// Load hash from your password DB.

let transporter = nodemailer.createTransport("SMTP",{
  host: 'smtp.gmail.com',
  port: 587,
  secure: true,
  auth:{
    user:"#########################",
    pass:"###############"
  }
});

  
encodeURIComponent(process.env.MONGO_ATLAS_PW)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  if (err) return console.error(err)//console.log(process.env.MONGO_ATLAS_PW) //console.error(err)
  console.log('Connected to Database')
  
  const db = client.db('megha')
  const quotesCollection = db.collection('login-details')
  app.set('view engine', 'ejs')
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(express.static(__dirname + '/public'));
  app.listen(3000, function() {
      console.log('listening on 3000')
  })

  var uname;

app.get('/forgetPassword_uname',(req,res)=>{
   res.render('forgetpassword_uname.ejs',{});
})

app.post('/results',(req,res)=>{
    var elecID=req.body.elecID;
    blockchain.showCandidates().then(candidates=>{
      console.log(elecID);
      blockchain.winnerr(elecID).then(result=>{
        console.log("winner list");
        console.log(result);
        console.log("winner list Ends here");
        res.render("results.ejs",{winner:result,elecID:elecID,candidates:candidates});
      })
    })
})


app.post('/forgetpassword_otp',(req,res)=>{
    uname=req.body.useremailid;
    const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });
    db.collection('login-otp').findOneAndUpdate
    ( 
      {username:uname },
      {$set : { oneTimePassword: otp,used:false }},
      {returnNewDocument : true}
    )
      console.log(otp);
      res.render('forgetpassword_otp.ejs',{username:uname});
})


app.post('/forgetpassword_pword',(req,res)=>{
    console.log(uname);
    var otp=req.body.otp;
    db.collection('login-otp').find({username:uname,oneTimePassword:otp}).count().then(result=>{
      if(result>0){
        res.render('forgetpassword_pword.ejs',{username:uname});
      } else{
            res.send("username or otp is incorrect!!");
      }
    })
    .catch(err=>{console.log(err)});
    
})


app.post('/forgetpassword_response',(req,res)=>{
    var password=req.body.password
    var repassword=req.body.repassword
    var email=req.body.emailId
    if(password==repassword && password.length>=8){
      var cipher = crypto.createCipher(algorithm, key);  
      var encrypted = cipher.update(password, 'utf8', 'hex') + cipher.final('hex');
      db.collection("login-details").findOneAndUpdate
      ( 
        {emailId:uname },
        {$set : { password: encrypted }},
        {returnNewDocument : true}
      )
      res.render("forgetpassword_response.ejs",{msg:"Password Updated!!"});
    }else{
      res.render("forgetpassword_response.ejs",{msg:"Please Enter Same Password!!"});
    }
})


app.get('/forgetpassword_response',(req,res)=>{
    res.render('index.ejs',{'msg':'hello'})
})


app.get('/', function (req, res) {
    // do something here
    //res.sendFile('/Users/ACER/Desktop/project frontend/index.html')
    res.render('index.ejs',{'msg':'hello'})
    db.collection('login-details').find().toArray()
    .then(results => {
      console.log("results")
    })
    .catch(error => console.error(error))
    //res.render('index.ejs', {})
})
  
app.post('/', (req,res)=>{
    var password=req.body.password
    var repassword=req.body.repassword
    var email=req.body.emailId
    var domail=email.split("@")[1];
    if(domail=='pec.edu.in' && password==repassword && password.length>=8)
    {
      console.log(password);
      var cipher = crypto.createCipher(algorithm, key);  
      var encrypted = cipher.update(password, 'utf8', 'hex') + cipher.final('hex');
        
      const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });
      db.collection('login-otp').insertOne(
      {
        "username":req.body.emailId,
        "otp":otp,
        "used":false
      }
      )
      blockchain_account=blockchain.createAccount();
      blockchain.addVoter(blockchain_account);
      db.collection('login-details').insertOne(
        {"firstName" : req.body.firstName, 
        "lastName" : req.body.lastName,
        "emailId" : req.body.emailId,
        "password" : encrypted,
        "status" : "Pending",
        "admin" : false,
        "voted" : false,
        "account":blockchain_account
        }
      )
        .then(results =>{
          res.render("index.ejs",{'msg':'registered'})
        })
        .catch(error => console.error(error))
    }
    else
    {
      //popup('Hello World!');
      res.render("index.ejs",{'msg':'pec id required or passwords are different (Note : password length must atleast be of 8)'})
    }
})

app.post('/applied',(req,res)=>{
  console.log(req.body.elecId);
  db.collection('login-details').find({emailId: uname}).toArray().then(results => {
    console.log(results);
    console.log(results[0].account);
    fullName = results[0].firstName+" "+results[0].lastName;
    blockchain.addCandidate(fullName,uname,req.body.elecId,results[0].account).then(function(){
        blockchain.showAllElections()
        .then(r=>{
          live_election=[];
            for(i=0;i<r.length;i++)
            {
              if(r[i].status==0)
              {
                live_election.push(r[i]);
                console.log(r[i]);
              }
            }
            console.log("live election list****************")
            console.log(live_election);
    
            applicationsStatus=[];
    
        blockchain.showCandidates().then(resr=>{
    
          for(i=0;i<live_election.length;i++)
          {
            index=resr.findIndex(ele=>ele.electionId==live_election[i].id && ele.email==uname);
            if(index==-1){
              applicationsStatus.push("Apply");
            }else{
              if(resr[index].applicationStatus==0){
                applicationsStatus.push("PENDING");
              }else if(resr[index].applicationStatus==1){
                applicationsStatus.push("APPROVED");
              }else{
                applicationsStatus.push("REJECTED");
              }
            }
          }
          console.log(applicationsStatus);
          res.render("apply.ejs",{liveElection:live_election,applicationsStatus:applicationsStatus});
        } 
        ) 
        });
      })
      .catch(error => {
        console.log(error);
      })
    }).catch(error =>{ 
    console.log(error);
    res.send("db error")});
});

app.post('/voted',(req,res)=>{
    var votedId=req.body.selectpicker; /// candidate ki id
    var len;
    var eleID;
    var candID;
    console.log(votedId);
    console.log(typeof(votedId));
    if(typeof(votedId)=='object')
    {
      console.log("here1");
      len=votedId.length;
      for(var x=0;x<len;x++)
      {
        if(votedId[x]!="Choose...")
        {
          eleID=votedId[x].split("+")[1];
          candID=votedId[x].split("+")[2];
          break;
        }
      }
    }
    else
    {
      console.log("here2");
      eleID=votedId.split("+")[1];
      candID=votedId.split("+")[2];
    }
    console.log(typeof(votedId));
    console.log(votedId);
    
    
    console.log('####################################');
     console.log(votedId);
     db.collection('login-details').find({emailId: uname}).toArray()
     .then(results => {
       console.log(results);
      //console.log(results[0].account);
         blockchain.addVote(candID,eleID,results[0].account)
       .then(function(){
     //    console.log(r);
        console.log("voted");
        //res.send("voted");
        //res.resder("homepage2.ejs",{msg:"Thank you for voting",liveElection:null,electionList:[]});
       res.render('homepage.ejs',{msg:"Thank you for voting",liveElection:null,electionList:[]});
       
      })
       .catch(error => {
        //res.set({ 'content-type': 'charset=utf-8' });
         res.render('homepage.ejs',{msg:"Not allowed to Vote",liveElection:null,electionList:[]});
        console.log(error);
      })
     })
     .catch(error =>{ console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%');
       console.log(error);
       res.send("db error")});
});


app.post('/admin_choice',(req,res)=>{
    res.render('admin_choice.ejs',{});
})


app.get('/admin_add_elections',(req,res)=>{
    res.render('admin_add_elections.ejs',{flag:0})
})

app.post('/show_elections',(req,res)=>{
    var btn=req.body.status;
    console.log(btn);
    var subject=btn.split("+")[0];
    var status=btn.split("+")[1];
    var electionID=parseInt(btn.split("+")[2]);
    blockchain.showCandidates()
    console.log(electionID);
    if(status==0)
    {
      blockchain.startElection(electionID+1)
    }
    else if(status==1)
    {
      blockchain.endElection(electionID+1)
    }
    blockchain.showAllElections()
      .then(results =>{
        blockchain.showCandidates()
        .then(candidates=>{
        res.render("show_elections.ejs",{voting_lines:results,candidates:candidates});
      })
      })
    console.log(btn);
})


app.get('/show_elections',(req,res)=>{
    blockchain.showAllElections()
      .then(results =>{
        blockchain.showCandidates()
        .then(candidates=>{
          res.render("show_elections.ejs",{voting_lines:results,candidates:candidates});
        })
        
      })
})

app.get('/review_application',(req,res)=>{

  blockchain.showCandidates()
  .then(r=>{
    console.log(r);
       
      res.render("applicationReview.ejs",{candidates:r});
  }); 

})

app.post('/approved',(req,res)=>{

  console.log(req.body.candidateId);
  blockchain.approveCandidate(req.body.candidateId).then(r=>
    blockchain.showCandidates()
  .then(r=>{
    console.log(r);
       
      res.render("applicationReview.ejs",{candidates:r});
  })
  ).catch(err=>{console.log(err)});
})

app.post('/rejected',(req,res)=>{

  console.log(req.body.candidateId);
  blockchain.rejectCandidate(req.body.candidateId).then(r=>
    blockchain.showCandidates()
  .then(r=>{
    console.log(r);
       
      res.render("applicationReview.ejs",{candidates:r});
  })
  ).catch(err=>{console.log(err)});
})

app.get('',(req,res)=>{
    res.send("working")
})

app.post('/elections_added',(req,res)=>{ 
    var subject=req.body.Subject;
    var details=req.body.Details;
    var sdate=req.body.sdate;
    var edate=req.body.edate;
    var count=parseInt(req.body.candidatesNo);
    console.log(count)

    var candidates=[];
    candidates=req.body.name;
    console.log(candidates);
    if(count<1)
    {
      res.redirect('/admin_add_elections')
    }
   // blockchain.addElection(subject,details,sdate,edate,candidates);


   blockchain.addElection(subject,details,sdate,edate);

    db.collection('voting-lines').insertOne(
        {"Subject" :subject, 
        "details" : details,
        "sdate" : sdate,
        "edate" : edate,
        "candidates" : candidates,
        "status":"UpComing",
        //"candidatesID":candidatesID
        }
      )
      //.then(results =>{
        res.render('admin_add_elections.ejs',{msg:"Election Added Successfully",flag:1});
        //res.render('elections_added.ejs',{});
        //res.render('admin_add_elections.ejs',{});
        //res.redirect(req.get('referer'));
      //})
      //.catch(error => console.error(error))
        //console.log(error);
      //res.render('admin_add_elections.ejs',{});
});

app.post('/voter_choice',(req,res)=>{
    var otp=req.body.otp;
    db.collection('login-otp').find({username:uname,oneTimePassword:otp}).count()
    .then(result=>{
      if(result>0)
      {
        res.render('voter_choice.ejs',{});
      }
      else{
            res.send("enter correct otp");
          }
    })
    .catch(err=>{console.log(err)});
})

app.get('/homepage',(req,res)=>
  {

    blockchain.showAllElections()
    .then(r=>
    {
      live_election=[];
      finished_elections=[];
      var count=0;
      var countf=0;
      for(i=0;i<r.length;i++)
      {
        if(r[i].status==1)
        {
          live_election[count++]=r[i];
        }
        else if(r[i].status==2)
        {
          finished_elections[countf++]=r[i];
        }
      }
      candidates=[];
      candidates_finished=[];
      blockchain.showCandidates()
      .then(c_list=>
      {
        if(count!=0)
        {
          var count2=0;
          for(var j=0;j<count;j++)
          {
            candidates[j]=[]
            count2=0;
            for(i=0;i<c_list.length;i++)
            {
                if(live_election[j].id==c_list[i].electionId && c_list[i].applicationStatus==1)
                candidates[j][count2++]=c_list[i];
            }
          }
        }
        if(countf!=0)
        {
          var count2=0;
          for(var j=0;j<countf;j++)
          {
            candidates_finished[j]=[]
            count2=0;
            for(i=0;i<c_list.length;i++)
            {
              if(finished_elections[j].id==c_list[i].electionId && c_list[i].applicationStatus==1)
              candidates_finished[j][count2++]=c_list[i];
            }
          }
        }
        console.log(candidates);
        console.log("Break");
        console.log(candidates_finished);
        res.render("homepage.ejs",{candidates:candidates,candidates_finished:candidates_finished,electionList:finished_elections,liveElection:live_election});
      }).catch(err=>{console.log(err)});
    }).catch(err=>console.log("ERRORRR"+err));
    });


  /////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////homepage//////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////
  // app.post('/homepage',(req,res)=>{
  //   //var otp=req.body.otp
  //   //console.log(uname);
  //   //console.log(otp);
  //   //db.collection('login-otp').find({username:uname,oneTimePassword:otp}).count()
  //   //.then(results=>{
  //     //if(results>0)
  //     //{
  //     //  blockchain.addElection();
  //     //  var election_list=blockchain.showAllElections();
  //     db.collection('login-details').find().toArray()
  //     .then(results =>{
  //      // res.setHeader('content-type', 'application/javascript');
  //      blockchain.showAllElections()
  //      .then(r=>{
  //        live_election=null;
  //        for(i=0;i<r.length;i++)
  //        {
  //          if(r[i].status==1)
  //          {
  //            live_election=r[i];
  //            break;
  //          }
  //        }
  //        candidates=[];
  //        //live_election=r[0];
  //        console.log(live_election);
  //        if(live_election!=null)
  //        {
  //          blockchain.showCandidates()
  //          .then(c_list=>{
  //            for(i=0;i<c_list.length;i++)
  //            {
  //              if(live_election.id==c_list[i].electionId)
  //              candidates.push(c_list[i]);
  //            }
  //            res.render("homepage.ejs",{candidates:candidates,electionList:r,liveElection:live_election});
  //          }).catch(err=>{console.log(err)});
  //        }
  //        else res.render("homepage.ejs",{candidates:candidates,electionList:r,liveElection:live_election});

  //      })
  //      .catch(err=>console.log("ERRORRR"+err));

  //     });
  //     }
  //     else{
  //       res.send("enter correct otp");
  //     }
  //   })
  // })

  app.get('/apply',(req,res)=>{
    
    blockchain.showAllElections()
    .then(r=>{
      live_election=[];
         for(i=0;i<r.length;i++)
         {
           if(r[i].status==0)
           {
            live_election.push(r[i]);
            console.log(r[i]);
           }
         }
         console.log("live election list****************")
         console.log(live_election);

         applicationsStatus=[];

    blockchain.showCandidates().then(resr=>{

      for(i=0;i<live_election.length;i++)
      {
        index=resr.findIndex(ele=>ele.electionId==live_election[i].id && ele.email==uname);
        if(index==-1){
          applicationsStatus.push("Apply");
        }else{
          if(resr[index].applicationStatus==0){
             applicationsStatus.push("PENDING");
          }else if(resr[index].applicationStatus==1){
            applicationsStatus.push("APPROVED");
          }else{
            applicationsStatus.push("REJECTED");
          }
        }
      }
      console.log(applicationsStatus);
      res.render("apply.ejs",{liveElection:live_election,applicationsStatus:applicationsStatus});
     } 
    ) 
    });
});

app.post('/main',(req,res)=>{
  var otp=req.body.otp
  console.log(uname);
  console.log(otp);
  db.collection('login-otp').find({username:uname,oneTimePassword:otp}).count()
  .then(results=>{
    if(results>0)
    {
      res.render("main.ejs");
    }
    else{
      res.send("enter correct otp");
    }
  })
})

  app.post('/next', (req, res) => {
    console.log(req.body)
    uname=req.body.email
    var pword=req.body.password
    if(uname=='admin@pec.edu.in')
    {
      if(pword=="admin123")
      {
      console.log("login succcessful for admin")
      db.collection('login-details').find().toArray()
      .then(results =>{
        //res.setHeader('/next','/admin');
        res.render("adminportal2.ejs",{login_details : results})
      })
      }
      else{
        res.render("index.ejs",{msg:"Enter Correct Password"})
      }
    }
    else
    {
      var cipher = crypto.createCipher(algorithm, key);  
      var encrypted = cipher.update(pword, 'utf8', 'hex') + cipher.final('hex');

      db.collection('login-details').find({emailId: uname,password:encrypted}).count()
      .then(results =>{
        if(results>0)
        {
          console.log(results);
          console.log("login succcessful")
          const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });
          console.log(otp)
          let mailOptions={
              form: 'authentication90@gmail.com',
              to: uname,
              subject: "test", 
              text: "Please enter the below mentioned otp in order to login "+ otp
          };

          transporter.sendMail(mailOptions, (err,data)=>{
            if(err){
              console.log(err);
            }
            else{
              console.log("success");
            }
          });
          res.render("otppage.ejs",{username : uname, oneTimePassword : otp})
          db.collection('login-otp').findOneAndUpdate
          ( 
            {username:uname },
            {$set : { oneTimePassword: otp,used:false }},
            {returnNewDocument : true}
         )
        }
        else if(results==0)
        {
          console.log(results);
          console.log("login unsucccessful")
          res.render("home.ejs",{})
        }
      })
      .catch(error => console.log("login unsuccessful"))
    }
  });
});