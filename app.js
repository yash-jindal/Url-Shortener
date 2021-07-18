const express = require('express');
const mongoose = require('mongoose');
const shortId = require('shortid');
const bodyParser = require('body-parser');
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://yash:user-is-best@cluster0.svleh.mongodb.net/UrlDB", { useNewUrlParser: true, useUnifiedTopology: true});

const shortUrlSchema = new mongoose.Schema ({
full: {
    type: String,
    required: true
},
short: {
    type: String,
    required: true,
    default: shortId.generate
}
});

const Url = mongoose.model("Url", shortUrlSchema);

var allUrls = [];
Url.find({}, function(err, found){
    if(found!=null)
    for(var j = 0;j<found.length;j++){
        allUrls.push(found[j]);
    }
})

app.get("/", function(req,res){
    res.render('index', {shortUrl: "", data: allUrls});
});
app.post("/short",function(req,res){
    var longUrl = req.body.fullUrl;
    if(longUrl.length===0){
      res.render('index', {shortUrl: "Invalid Input", data: allUrls});
  }else{
      var check = 0,index;
      if(allUrls!=null)
    for(var i=0;i<allUrls.length;i++){
        if(allUrls[i].full===longUrl){
           check=1;
           index=i;
           break;
        }
    }
    if(check===1){
        res.render('index', {shortUrl: "http://localhost:3000/" + allUrls[index].short, data: allUrls});
    }else{
        const newItem = new Url ({
            full: longUrl
        })
        newItem.save();
        allUrls.push(newItem);
        res.render('index', {shortUrl: "http://localhost:3000/" + newItem.short, data: allUrls});
    }
  }
  });
  app.get("/:code", function(req,res){
    Url.findOne({short: req.params.code}, function(err, urls){
        if(err){
          console.log(err);
        }else{
            res.redirect(urls.full);
        }
   })
});
app.post("/delete", function(req,res){
    const value = req.body.deleteUrl;
    for(var b = 0;b<allUrls.length;b++){
        if(allUrls[b].short === value){
             allUrls.splice(b,1);
             break;
        }
    }
    Url.deleteOne({short: value}, function(err, urls){
     if(err){
       console.log(err);
     }else{
         res.redirect("/");
     }
 })
 });
 app.post("/update", function(req,res){
    res.render('upage', {link: req.body.updateUrl, small: req.body.shortUrl})
});
app.post("/update2", function(req,res){
    for(var m = 0;m<allUrls.length;m++){
        if(allUrls[m].short === req.body.key){
            allUrls[m].full = req.body.newUrl;
            break;
        }
    }
   Url.findOneAndUpdate({short: req.body.key}, {full: req.body.newUrl}, function(err, foundUrl){
       if(!err){
        res.redirect("/");        
       }
   })
});
app.post("/find", function(req,res){
    Url.findOne({full: req.body.findUrl}, function(err, yeah){
            res.render('found', {huge: req.body.findUrl, tiny: yeah!=null?yeah.short:"Not Found"})
    })
});
mongoose.connection.on('open', () => {
    app.listen(3000, function(req, res){
        console.log("server started on port 3000");
    })
});