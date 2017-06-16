var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var xmlParse=require('xml2js').parseString;
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sha1=require('sha1');
var routes = require('./routes/index');
var users = require('./routes/users');
var common=require('./common');
var request=require('request');
var app = express();
var data='';
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.get('/validate',(req,res,next)=>{
	let token='wechat';
	let signature=req.query.signature;
	let timestamp=req.query.timestamp;
	let echostr=req.query.echostr;
	let nonce=req.query.nonce;
	let oriArray=new Array();
	oriArray.push(nonce);
	oriArray.push(timestamp);
	oriArray.push(token);
	let original=oriArray.sort().join('');
	let combineStr=sha1(original);
	if(signature==combineStr){
		res.send(echostr);
	}else{
		console.log('error');
	}
	next();
});
app.post('/validate',(req,res,next)=>{
	var data='';
	req.on('data',(chunk)=>{
		data+=chunk;
	});
	req.on('end',()=>{
		xmlParse(data,(err,result)=>{
			if(result.xml.MsgType=='event'){
				if(result.xml.Event=='subscribe'){
					common.dealText('欢迎关注聊天小喵;\n 1.发送地址定位信息可以获得当地天气情况哟\n 2.发送歌曲名字可以获取想要听的歌哟\n3.发送语音信息可以直接小喵聊天哟，她会很多东西哟\n图片,视频识别功能还在开发中\n',res,result);
				}else if(result.xml.Event=='CLICK' && result.xml.EventKey=='V1001_IT_NEWS'){
					common.requestMsg('https://api.tianapi.com/it/?key=82bd10ccb529c5eab05c58c858ecfe43&num=2',result,res);
				}else if(result.xml.Event=='CLICK' && result.xml.EventKey=='V1001_TRAVEL_NEWS'){
					common.requestMsg('https://api.tianapi.com/travel/?key=82bd10ccb529c5eab05c58c858ecfe43&num=2',result,res);
				}else if(result.xml.Event=='CLICK' && result.xml.EventKey=='V1001_VR_NEWS'){
					common.requestMsg('https://api.tianapi.com/vr/?key=82bd10ccb529c5eab05c58c858ecfe43&num=2',result,res);	
				}else if(result.xml.Event=='CLICK' && result.xml.EventKey=='V1001_AMUSE_NEWS'){
					common.requestMsg('https://api.tianapi.com/huabian/?key=82bd10ccb529c5eab05c58c858ecfe43&num=2',result,res);
				}
			}
			if(result.xml.MsgType=='location'){
					let lat=(result.xml.Location_X);
					let log=(result.xml.Location_Y);
					const url='http://api.yytianqi.com/forecast7d?city='+lat+','+log+'&key=1r3fajefo4csg9tm';
					common.requestWeather(url,result,res);					
			}
			if(result.xml.MsgType=='image'){
				let str= '<xml><ToUserName><![CDATA['+result.xml.FromUserName+']]></ToUserName><FromUserName><![CDATA['+result.xml.ToUserName+']]></FromUserName><CreateTime>'+new Date().getTime()+'</CreateTime><MsgType><![CDATA['+'image'+']]></MsgType><Image><MediaId><![CDATA['+result.xml.MediaId+']]></MediaId></Image></xml>';
				res.send(str);
			}
			if(result.xml.MsgType=='text'){
				let responseMSg=(result.xml.Content).toString();
				let url=encodeURI("http://s.music.163.com/search/get?type=1&limit=10&offset=0&s="+responseMSg);
				common.requestSong(url,result,res);		
			}
			if(result.xml.MsgType=='voice'){
				let url='http://www.tuling123.com/openapi/api?key=160008fd95b54edead25c454190a1e33&info='+encodeURI(result.xml.Recognition.toString());
				common.requestRobot(url,result,res);	
			}

			if(result.xml.MsgType=='video'){
				let str='<xml><ToUserName><![CDATA['+result.xml.FromUserName+']]></ToUserName><FromUserName><![CDATA['+result.xml.ToUserName+']]></FromUserName><CreateTime>'+new Date().getTime()+'</CreateTime><MsgType><![CDATA['+'video'+']]></MsgType><Video><MediaId><![CDATA['+result.xml.MediaId+']]></MediaId><Title><![CDATA['+'video_info'+']]></Title><Description><![CDATA['+'information'+']]></Description></Video></xml>'
				res.send(str);
			}

		});
	});

});
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
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
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
