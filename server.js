const app = require('./app');
const port = process.env.PORT || 5000;


//listening to port //#endregion
app.listen(port,()=>{
    console.log("cirPortal");
});

