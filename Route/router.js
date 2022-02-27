const Express = require('express');
const { redirect } = require('express/lib/response');
const Route = Express.Router();
const auth = require('../auth/auth')
const course = require('../schema/course')
const broucher = require('../schema/broucherForm')



Route.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname+'/index.html'));
})

Route.get("/login",(req,res)=>{
    if(req.session.loggedin){
        res.render("dashboard",{form:"All entries"})
    }
    else{
        res.render("login")
    }
})

Route.get("/admin",auth,(req,res)=>{
  
        res.render("dashboard",{form:"Broucher Form Requests",broucher:true,course:false})

})
Route.get("/admin/:form",auth,async(req,res)=>{
    const courseData =await course.find().lean()
    const broucherData =await broucher.find().lean()

    // console.log(data)
    if(req.params.form==="broucher")
        res.render("dashboard",{form:"Broucher Form Requests",broucher:true,course:false,broucherData})
    else if(req.params.form==="course"){
        res.render("dashboard",{form:"Course Form Entries",broucher:false,course:true,courseData})
    }
    else{
        res.redirect("/").status(404)
    }
})

Route.post("/login",(req,res)=>{
   const {email,password} = req.body;
   if(email==="admin@gmail.com" && password==="admin123"){
        req.session.loggedin = true;
        res.redirect("/admin/broucher")
   } 
})
Route.post("/broucher",async(req,res)=>{
    const {fname,lname,phone,email} = req.body
    try{
        if(fname,lname,phone,email){
            console.log(lname)
            const data =new broucher({
                fname,lname,phone,email
            })
            await data.save();
            res.redirect("/")
        }
    }catch(err){
        console.log("Data not been saved")
        console.log(err)
    }   
})

Route.post("/course",async(req,res)=>{
    const {fname,lname,phone,email} = req.body
    try{
        if(fname,lname,phone,email){
            console.log(lname)
            const data =new course({
                fname,lname,phone,email
            })
            await data.save();
            res.redirect("/")
        }
    }catch(err){
        console.log("Data not been saved")
        console.log(err)
    }   
})
Route.get("/logout",(req,res)=>{
    req.session.loggedin= false;
    res.redirect("/login")
})
module.exports = Route