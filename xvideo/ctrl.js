let fav = require('../favjson.js');
const host = 'https://www.xvideos.com'
let xvideo = require('./ReqParse.js');

console.reset =  function () {
  return process.stdout.write('\033c');
};

function homeXv(){
	let obj={};
	obj.page = 0;//initial
	obj.videoList = [];
	obj.nextPage = async function(){
		try{
			let temp = await xvideo.hpc(obj.page);
			obj.videoList = obj.videoList.concat(temp);
			obj.page+=1;
		}catch(err){
				console.log('No more home page :(');
				throw new Error('no content');
			}
	};
	obj.pointer = 0;
	obj.index = 0;
	obj.renderTen = function(){
		try{
			console.reset();
			for(let i=obj.index;i<obj.index+10;i++){
				if(i==obj.pointer){
					console.log('->	'+obj.videoList[i].attr.name)
					if(obj.videoList[i].tag!==undefined) console.log('		------>'+obj.videoList[i].tag);
					
				}
				else console.log('  	'+obj.videoList[i].attr.name);
			}
			console.log('==========================================================')
			console.log('"right" : See the video tag')
			console.log('"space" : Add favorite ')
			console.log('"enter" : Watch the video')
		}catch(err){
			console.reset();
			console.log('loading...')
			obj.nextPage().then(()=>{obj.renderTen()},err=>{console.log(err)});
		}
	}
	obj.down = function(){
		obj.pointer+=1;
		if(Math.floor(obj.pointer/10)> Math.floor((obj.pointer-1)/10)) obj.index+=10;
		//console.log(obj.index);
		obj.renderTen();
	}
	obj.up = function(){
		if(obj.pointer==0){
			obj.renderTen();
			return;
		}
		obj.pointer-=1;
		if(Math.floor(obj.pointer/10)< Math.floor((obj.pointer+1)/10)) obj.index-=10;
		obj.renderTen();
	}

	obj.right = async function(){
		try{
			if(obj.videoList[obj.pointer].tag==undefined){
				obj.videoList[obj.pointer].tag = 'Waiting...'
				obj.renderTen();
				let tag = await xvideo.tagCrawl(obj.videoList[obj.pointer].attr.link);
				obj.videoList[obj.pointer].tag = tag;
				obj.renderTen();
			}
		}catch(err){
				obj.videoList[obj.pointer].tag = 'No Tag'
				obj.renderTen();
				//console.log('No more tag');
				//throw new Error('no tag');
			}
	};

	obj.save = async function(){
			if(obj.videoList[obj.pointer].tag==undefined){
				let tag = await xvideo.tagCrawl(obj.videoList[obj.pointer].attr.link);
				obj.videoList[obj.pointer].tag = tag;
			}

			fav.addjson(obj.videoList[obj.pointer]);
			obj.renderTen();
			console.log('Save Success');
	}

	obj.open = function(){
		const opn = require('openurl');

		if(obj.videoList[obj.pointer]!=undefined){
			videoUrl = host+obj.videoList[obj.pointer].attr.link;
			opn.open(videoUrl);
		}
	}
	return obj;
}

function keyXv(key){
	let obj = homeXv();
	obj.keyword = key;
	obj.nextPage = async function(){	
		try{
			let temp = await xvideo.kwc(obj.keyword,obj.page);
			obj.videoList = obj.videoList.concat(temp);
			obj.page+=1;
		}catch(err){
			console.log('No keyword porn find...sorry:(')
			throw new Error('no content');
		}
	};
	return obj;
}

function favXv(){
	let obj = homeXv();
	obj.videoList = fav.readjson();

	obj.down = function(){
		obj.pointer==obj.videoList.length-1?obj.pointer=obj.videoList.length-1:obj.pointer+=1;
		if(Math.floor(obj.pointer/10)> Math.floor((obj.pointer-1)/10)) obj.index+=10;
		//console.log(obj.index);
		obj.renderTen();
	}

	obj.delete = function(){
		console.reset();
		try{
			for(let i=obj.index;i<obj.index+10;i++){
				if(obj.videoList[i]==undefined) break;
				if(i==obj.pointer) console.log('->	Delete')
				else console.log('  	'+obj.videoList[i].attr.name);
			}
			obj.videoList.splice(obj.pointer,1);
			fav.cleanjson();
			for(let i=0;i<obj.videoList.length;i++){
				fav.addjson(obj.videoList[i]);
			}

		}catch(err){
			console.log(err);
			console.log('Nothing in your fav list, press "<-" back to menu')
		}
	}

	obj.right = function(){
		console.reset();
		try{
			for(let i=obj.index;i<obj.index+10;i++){
				if(i==obj.pointer){
					console.log('->	'+obj.videoList[i].attr.name)
					if(obj.videoList[i].tag!==undefined){
						console.log('		------>'+obj.videoList[i].tag);
						}	
					}
				else console.log('  	'+obj.videoList[i].attr.name);
			}
		}catch(err){
			console.log('press "<-" back to menu')
		}

	}
	obj.renderTen = function(){
		console.reset();
		try{
			for(let i=obj.index;i<obj.index+10;i++){
				if(obj.videoList[i]==undefined) break;
				if(i==obj.pointer) console.log('->	'+obj.videoList[i].attr.name)
				else console.log('  	'+obj.videoList[i].attr.name);
			}
			console.log('==========================================================')
			console.log('"right" : See the video tag')
			console.log('"enter" : Watch the video')
			console.log('    "d" : Delete this video')
		}catch(err){
			console.log('Nothing in your fav list, press "<-" back to menu')
		}
	}
	return obj
}

exports.homepage = homeXv;
exports.keypage = keyXv;
exports.favpage = favXv;
