var request=require('request');
//click事件推送
function requestMsg(url,result,res){
	request(url,(err,response,body)=>{
		let data=JSON.parse(body);
		let arr=data.newslist;
		let str='<xml><ToUserName><![CDATA['+result.xml.FromUserName+']]></ToUserName><FromUserName><![CDATA['+result.xml.ToUserName+']]></FromUserName><CreateTime>'+new Date().getTime()+'</CreateTime><MsgType><![CDATA['+'news'+']]></MsgType><ArticleCount>'+'2'+'</ArticleCount><Articles><item><Title><![CDATA['+arr[0].title+']]></Title> <Description><![CDATA['+arr[0].description+']]></Description><PicUrl><![CDATA['+arr[0].picUrl+']]></PicUrl><Url><![CDATA['+arr[0].url+']]></Url></item><item><Title><![CDATA['+arr[1].title+']]></Title><Description><![CDATA['+arr[1].deacription+']]></Description><PicUrl><![CDATA['+arr[1].picUrl+']]></PicUrl><Url><![CDATA['+arr[1].url+']]></Url></item></Articles></xml>';
		res.send(str);
	});
}
//地理位置事件处理
function requestWeather(url,result,res){
	request(url,(err,response,body)=>{
		if(err){
			console.log(err);
		}

		data=JSON.parse(body);
		dealText('城市: '+data.data.cityName+'\n时间:'+data.data.sj+'\n天气情况:'+data.data.list[0].tq1+'\n白天温度:'+data.data.list[0].qw1+'度\n夜间温度'+data.data.list[0].qw2+'度\n白天风向 :'+data.data.list[0].fx1+'\n夜间风向：'+data.data.list[0].fx2+'\n',res,result);
	});
}
//处理文本点歌
function requestSong(url,result,res){
	request(url, function (error, response, body) {
			if(error){
				dealText('出错请重试！',res,result);
			 }else if (!error && response.statusCode == 200) {
				var data=JSON.parse(body);
				if(data.result){
				    let url=data.result.songs[0].audio;
				    console.log(url);
				    request(url,(error, response, body)=>{
				    	if(response["headers"]["content-type"]=='text/html'){
				    		dealText('没有资源，请选择其他歌曲',res,result);
				    	}else{
				    		let picUrl=data.result.songs[0].album.picUrl;
				    		let str='<xml><ToUserName><![CDATA['+result.xml.FromUserName+']]></ToUserName><FromUserName><![CDATA['+result.xml.ToUserName+']]></FromUserName><CreateTime>'+new Date().getTime()+'</CreateTime><MsgType><![CDATA['+'music'+']]></MsgType><Music><Title><![CDATA['+data.result.songs[0].name+']]></Title><Description><![CDATA['+'悠悠音乐，缕缕动听'+']]></Description><MusicUrl><![CDATA['+url+']]></MusicUrl><HQMusicUrl><![CDATA['+url+']]></HQMusicUrl><ThumbMediaId><![CDATA['+'ojH9Q9iDl50J6PjyFmQcYYKg51COLtm2SJpFdDFzR0jYNYt4JOjtfee0LKNDYzQa'+']]></ThumbMediaId></Music></xml>';
							res.send(str);
				    	}
				    	
				    });		
					
				}else{
				   dealText('发送歌曲名字不合法,请重试',res,result);
				}
			}

	});
}
function requestRobot(url,result,res){
	request(url,(error,response,body)=>{
		if(!error && response.statusCode==400){
			dealText('智能小喵我病了，病好了再和你聊天。。。',res,result);
		}
		let data=JSON.parse(body);
		if(data.url){
			dealText(data.text+data.url,res,result);
		}else{
			dealText(data.text,res,result);
		}
		
	});
}
function dealText(responseMSg,res,result){
		let str='<xml><ToUserName><![CDATA['+result.xml.FromUserName+']]></ToUserName><FromUserName><![CDATA['+result.xml.ToUserName+']]></FromUserName><CreateTime>'+new Date().getTime()+'</CreateTime><MsgType><![CDATA['+'text'+']]></MsgType><Content><![CDATA['+responseMSg+']]></Content></xml>';
		res.send(str);
}
exports.requestSong=requestSong;
exports.requestWeather=requestWeather;
exports.requestMsg=requestMsg;
exports.dealText=dealText;
exports.requestRobot=requestRobot;