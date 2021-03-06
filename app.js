var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var routes = require('./routes/index');
var settings = require('./settings');
var flash = require('connect-flash');
//var multer  = require('multer');
//var users = require('./routes/users');

//生成一个express实例 app
var app = express();

// view engine setup
//设置 views 文件夹为存放视图文件的目录, 即存放模板文件的地方,__dirname 为全局变量,存储当前正在执行的脚本所在的目录
app.set('views', path.join(__dirname, 'views'));
//设置视图模板引擎为 ejs
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//设置/public/favicon.ico为favicon图标
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//加载日志中间件
app.use(logger('dev'));
//加载解析json的中间件
app.use(bodyParser.json());
//加载解析urlencoded请求体的中间件
app.use(bodyParser.urlencoded({ extended: false }));
//加载解析cookie的中间件
app.use(cookieParser());
//设置public文件夹为存放静态文件的目录
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: settings.cookieSecret,//防止篡改 cookie
    key: settings.db,//cookie name -> sessionId
    cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
    resave: true,//false,
    saveUninitialized: true,
    store: new MongoStore({ //把会话信息存储到数据库中
        db: settings.db,
        host: settings.host,
        port: settings.port
    })
}));
/***flash 依赖 cookieParser & session！！***/
//flash 是一个在 session 中用于存储信息的特定区域。信息写入 flash ，下一次显示完毕后即被清除
app.use(flash());
//路由控制器
//app.use('/', routes);
//app.use('/users', users);
routes(app);


//使用multer中间件上传图片

//var upload = multer({
////    dest: './public/images',//上传图片保存路径
////    rename: function (fieldname, filename) {
////        return filename;
////    }
//    destination: function(req, file, cb){
//        cb(null, './public/images')
//    },
//    filename: function (req, file, cb) {
//        cb(null, file.fieldname /*+ '-' + Date.now()*/)
//    }
//});
//app.use(upload);

// catch 404 and forward to error handler
//捕获404错误，并转发到错误处理器
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
//开发环境下的错误处理器，将错误信息渲染error模版并显示到浏览器中
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
//生产环境下的错误处理器，将错误信息渲染error模版并显示到浏览器中
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

//导出app实例供其他模块调用
module.exports = app;
