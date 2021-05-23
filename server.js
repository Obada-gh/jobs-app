'use strict';

require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const methodoverride= require('method-override');
const cors = require('cors');
const { redirect } = require('statuses');

const app = express();
app.use(cors());
app.use(methodoverride('_method'));
app.use(express.static('./public'));
app.use(express.urlencoded({extended:true}));
app.set('view engine','ejs');

const client = new pg.Client(process.env.DATABASE_URL);
const PORT = process.env.PORT || 2070;
client.connect().then(()=>{
  app.listen(PORT,()=>{
    console.log(`i am on ${PORT}`); }); });



app.get('/',(req,res)=>{
  let url = `https://jobs.github.com/positions.json?location=usa`;
  superagent(url).then((data)=>{
    let jobs = data.body;
    // console.log(jobs);
    let jobsMap=jobs.map((item)=>{
      return new JobsCon(item);
    });

    return res.render('pages/index',{jobsMap});


  });
});


function JobsCon(data){
  this.title=data.title;
  this.company=data.company;
  this.location=data.location;
  this.url=data.url;
}

app.get('/searchpage',(req,res)=>{
  res.render('pages/search');

});


app.get('/search',(req,res)=>{
  let description = req.query.description;
  let url = `https://jobs.github.com/positions.json?description=${description}&location=usa`;
  superagent(url).then((data)=>{
    let dataDes = data.body;
    let dataDesMap = dataDes.map((item)=>{
      return new JobsCon(item);
    });
    return res.render('pages/results',{dataDesMap});

  });

});

app.post('/add-to-my-list',(req,res)=>{
  let {title,company,location,url} = req.body;
  let val = [title,company,location,url];
  let sql = 'INSERT INTO jobs (title,company,location,url) VALUES ($1,$2,$3,$4);';
  client.query(sql,val).then(()=>{
    res.redirect('/list');

  });

});

app.get('/list',(req,res)=>{
  let sql = 'SELECT * FROM jobs;';
  client.query(sql).then((data)=>{
    let sqlData = data.rows;
    let sqlDataMap = sqlData.map((item)=>{
      return new JobsCon(item);
    });
    return res.render('pages/list',{sqlDataMap});

  });
});


app.get('/details/:id',(req,res)=>{
  let sql = 'SELECT * FROM jobs WHERE id=$1;';
  let val=[req.params.id];
  client.query(sql,val).then((data)=>{
    return res.render('pages/details',{sqlDataId:data.rows[0]});
  });

});




app.put('/update/:id',(req,res)=>{

  let {title,company,location,url} = req.body;
  let val =[title,company,location,url,req.params.id];
  let sql = 'UPDATE jobs SET (title,company,location,url) WHERE id=$5;';
  client.query(sql,val).then(()=>{
    return res.redirect(`/details/${req.params.id}`);
  });
});

app.delete('/delete/:id',(req,res)=>{
  let sql = 'DELETE FROM jobs WHERE id=$1;';
  let val=[req.params.id];
  client.query(sql,val).then(()=>{
    return res.redirect('/list');
  });
});







