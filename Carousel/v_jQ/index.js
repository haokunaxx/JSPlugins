;(function(){
	// 初始化参数
	const config = (target,origin) => {
		const _default = {
			el:'.J_carousel-wrap',
			paginationShow: false,
			direction: 'row',
			carouselData: null,
			carouselList: null,
			curPage: 0,
			limit: 80
		};
		Object.assign(target,_default,origin);
	}

	const getOldVal = (carousel,dir) => {
		let _this = carousel;
		let el = $(".J_carousel-list",_this.el);

		if(el.css('transform')==='none'){
			return 0;
		}

		if(dir === 'row'){
			return Number(el.css('transform').split(',')[4].trim())
		}else{
			// console.log(el.css('transform').split(',')[5].trim().split(''))
			return Number(el.css('transform').split(',')[5].trim().slice(0,-1));
		}


		// return el.css('transform')==='none' ? 0 : Number(el.css('transform').split(',')[dir === 'row' ? 4 : 5].trim());
	}

	// 模板替换
	const tplReplace = (tpl,obj) => {
		return tpl.replace(/{{(.*?)}}/g,(node,key) => obj[key]);
	}

	// 默认模板
	const _tpl = `
			<ul class="carousel-list J_carousel-list">
			</ul>
			<div class="pagination-wrap J_pagination-wrap">
				<ul class="pagination-list J_pagination-list">
				</ul>
			</div>`,
		_carouselItemTpl = `<li class="carousel-item">
				<img src="{{imgSrc}}" alt="">
			</li>`,
		_paginationItemTpl = `<li class="pagination-item {{isActive}}"></li>`;

	const Touch = {
		start(e){
			this.oldVal = getOldVal(this,this.direction);

			this.begin = e.originalEvent.touches[0][this.direction === 'row' ? 'clientX' : 'clientY'];

			$(".J_carousel-list",this.el).css('transition','transform 0s linear');
		},
		move(e){
			this.cur = e.originalEvent.touches[0][this.direction === 'row' ? 'clientX' : 'clientY'];

			this.move = this.cur - this.begin + this.oldVal;
			this._move(this.direction);
			// console.log(e);
		},
		end(e){
			if(Math.abs(this.move) < Math.abs(this.limit)){

			}else{
				if(this.move > this.oldVal){
					this.curPage--; 
				}else{
					this.curPage++;
				}

				if(this.infinite){

				}else{
					this.curPage <= 0 && (this.curPage = 0);
					this.curPage >= this.CarLen - 1 && (this.curPage = this.CarLen - 1); 
				}
			}


			this.begin = 0;
			this.move = 0;
			$(".J_carousel-list",this.el).css('transition','transform .6s ease');
			this._scroll(this.direction,this.curPage);
		}
	}

	class Carousel{
		constructor(args){
			this.name = 'Carousel';

			config(this,args);

			this.init(args);
		}

		async renderCarousel(){
			// 没有传入数据的时候，使用children，类似插槽
			if(this.carouselData === null){	
				let children = $(this.el).children(),
					len = children.length;
				if(len === 0){
					throw Error("请提供模板");
				}
				this.CarLen = len;
				let paginationStr = '';

				$(this.el).append(_tpl);

				let carouselList = $('.J_carousel-list',this.el),
					paginationList = $('.J_pagination-list',this.el);

				for(let i = 0; i < len; i++){
					carouselList[0].insertBefore(children[i],null);
					paginationStr += tplReplace(_paginationItemTpl,{isActive:i === 0 ? 'active' : ''});
				}

				paginationList.append(paginationStr);

			}else if(this.carouselData !== null){	//传入数据的情况下
				let dataTemp = await this.carouselData;

				$(this.el).append(_tpl);

				let carouselList = $('.J_carousel-list',this.el),
					paginationList = $('.J_pagination-list',this.el);

				let dataLen = dataTemp.length;
				this.CarLen = dataLen;
				let tplTemp = this.carouselItemTpl ? this.carouselItemTpl : _carouselItemTpl,
					carouselStr = '',
					paginationStr = '';

				for(let i = 0; i< dataLen; i++){
					carouselStr += tplReplace(tplTemp,dataTemp[i]);
					paginationStr += tplReplace(_paginationItemTpl,{isActive:i === 0 ? 'active' : ''});
				}
				carouselList.append(carouselStr);
				paginationList.append(paginationStr);
			}
		}

		renderPagination(){
			let paginationWrap = $('.J_pagination-wrap',this.el);//缓存一下

			paginationWrap.addClass('show'); 
			this.direction === 'column' && paginationWrap.addClass('column');
		}

		setDirection(){
			// 设置方向
			this.direction === 'row' 
				?	$(this.el).addClass('row')
				:	$(this.el).addClass('column'); 
		}

		async render(){
			await this.renderCarousel();	
			this.paginationShow && this.renderPagination();
			this.setDirection();
		}

		// handleTouchStart(e){
		// 	// console.log(e);
		// 	this.oldVal = getOldVal(this,this.direction);
		// 	console.log(this.oldVal);
		// 	this.begin = e.originalEvent.touches[0][this.direction === 'row' ? 'clientX' : 'clientY'];
		// 	// this.direction === 'column' &&  
		// 	console.log(this.begin,$(this.el).offset());
		// 	$(".J_carousel-list",this.el).css('transition','transform 0s linear');
		// }
		// handleTouchMove(e){
		// 	this.cur = e.originalEvent.touches[0][this.direction === 'row' ? 'clientX' : 'clientY'];
		// 	// console.log(this.cur,this);

		// 	this.move = this.cur - this.begin + this.oldVal;
		// 	this._move(this.direction);
		// 	// console.log(e);
		// }
		// handleTouchEnd(e){
		// 	if(Math.abs(this.move) < Math.abs(this.limit)){

		// 	}else{
		// 		if(this.move > this.oldVal){
		// 			this.curPage--; 
		// 		}else{
		// 			this.curPage++;
		// 		}
		// 		// this.curPage < 
		// 		// this.infinite ?  
		// 		if(this.infinite){

		// 		}else{
		// 			this.curPage <= 0 && (this.curPage = 0);
		// 			this.curPage >= this.CarLen - 1 && (this.curPage = this.CarLen - 1); 
		// 		}
		// 	}


		// 	this.begin = 0;
		// 	this.move = 0;
		// 	$(".J_carousel-list",this.el).css('transition','transform .6s ease');
		// 	this._scroll(this.direction,this.curPage);
		// }
		_scroll(dir,idx){
			let widthTemp = window.innerWidth;
			let heightTemp = $(this.el).height();
			let oList = $(".J_carousel-list",this.el);
			dir === 'row' 
				? oList.css('transform',`translate3d(${-(widthTemp * idx)}px,0,0)`) 
				: oList.css('transform',`translate3d(0,${-(heightTemp * idx)}px,0)`);
		}
		_move(dir){
			let oList = $(".J_carousel-list",this.el);
			dir === 'row' 
				? oList.css('transform',`translate3d(${this.move}px,0,0)`) 
				: oList.css('transform',`translate3d(0,${this.move}px,0)`);
		}


		bindEvent(){
			// this.paginationShow && bindPaginationEvent();

			$(".J_carousel-list",this.el).on('touchstart',Touch.start.bind(this));
			$(".J_carousel-list",this.el).on('touchmove',Touch.move.bind(this));
			$(".J_carousel-list",this.el).on('touchend',Touch.end.bind(this));
		}

		async init(){
			console.log(this)
			await this.render();

			this.bindEvent();
		}
	}



	window.Carousel = Carousel;
}());