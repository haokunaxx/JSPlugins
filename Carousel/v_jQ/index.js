;(function(){
	// 初始化参数
	const config = (target,origin) => {
		const _default = {
			el:'.J_carousel-wrap',
			paginationShow: false,
			carDir: 'row',
			carouselData: null,
			carouselList: null,
			limit: 80,
			curPage: 0
		};
		Object.assign(target,_default,origin);
	}
	// 获取carouselList上已有的偏移量
	const getOldVal = (carousel,dir) => {
		let _this = carousel;
		let el = $(".J_carousel-list",_this.el);

		if(el.css('transform')==='none'){
			return 0;
		}

		if(dir === 'row'){
			return Number(el.css('transform').split(',')[4].trim())
		}else{
			return Number(el.css('transform').split(',')[5].trim().slice(0,-1));
		}
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
			if(this.transforming){
				
				!this.bouce && (this.bouce = true);
				return;
			};
			let list = $(".J_carousel-list",this.el);
			list.removeClass('bouceNext').removeClass('boucePrev');
			this.oldVal = getOldVal(this,this.carDir);

			this.begin = e.originalEvent.touches[0][this.carDir === 'row' ? 'clientX' : 'clientY'];

			list.css('transition','transform 0s linear');
		},
		move(e){
			if(this.transforming || this.begin === null)return;
			this.cur = e.originalEvent.touches[0][this.carDir === 'row' ? 'clientX' : 'clientY'];
			if(this.cur < this.begin){
				this.moveDir = 'next';
			}else{
				this.moveDir = 'prev';
			}
			this.move = this.cur - this.begin + this.oldVal;
			this.moveFollowTouch(this.carDir,this.move);
		},
		end(e){
			if(this.transforming || this.begin === null)return;
			let list = $(".J_carousel-list",this.el);

			if(isNaN(this.cur) || Math.abs(this.cur - this.begin) < Math.abs(this.limit)){
				this.scroll(this.carDir,this.curPage);
				return;
			}else{
				if(this.infinite){
					if(this.moveDir ==='next' ){
						this.curPage++;
					}else{
						this.curPage--; 
					}
				}
				this.transforming = true;
				this.scroll(this.carDir,this.curPage);

				let dir = this.moveDir;
				setTimeout(()=>{
					console.log(dir);
					if(dir ==='next' ){
						if(this.curPage >= this.CarLen - 1){
							this.curPage = 1;
						}
					}else{
						if(this.curPage <= 0){
							this.curPage = this.CarLen - 2;
						}
					}
					console.log(dir,this.curPage);
					this.moveImmediately(this.carDir,this.curPage);
					this.bouce && !list.hasClass('bouceNext') && !list.hasClass('boucePrev') && list.addClass(this.moveDir === 'next'  ? 'bouceNext': 'boucePrev');
				},600)

				setTimeout(()=>{
					
					this.moveDir = null;
					this.begin = null;
					this.move = 0;
					this.bouce = false;
					// list.removeClass('bouceNext').removeClass('boucePrev');
					this.transforming = false;
				},this.bouce ? 1400 : 700)
			}

			
			

			// console.log('touch end: ',this.curPage);
			// this.scroll(this.carDir,this.curPage);



			
			
			// list.css('transition','transform .6s ease');
			// console.log(this.curPage);
			// if(this.infinite){
			// 	this.scroll(this.carDir,this.curPage);
			// 	setTimeout(()=>{
					
			// 		if(this.curPage === 0){
			// 			this.curPage = this.CarLen - 2;
			// 		}else if(this.curPage > this.CarLen - 2){
			// 			this.curPage = 1;
			// 		}


			
					// this.moveImmediately(this.carDir,this.curPage);
			// 		this.transforming = false;

			// 	},700);
			// }else{
			// 	this.curPage <= 0 && (this.curPage = 0);
			// 	this.curPage >= this.CarLen - 1 && (this.curPage = this.CarLen - 1); 
			// 	this.scroll(this.carDir,this.curPage);
				
			// }
		},
		edgeLimit(){

		}
	}

	const render = {
		async carousel(){
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
					if(this.infinite){
						i < len -2 && (paginationStr += tplReplace(_paginationItemTpl,{isActive:i === 0 ? 'active' : ''}));
					}else{
						paginationStr += tplReplace(_paginationItemTpl,{isActive:i === 0 ? 'active' : ''});
					}
				}
				paginationList.append(paginationStr);

			}else if(this.carouselData !== null){	//传入数据的情况下
				let dataTemp = await this.carouselData;

				$(this.el).append(_tpl);
				if(this.infinite){
					let firstOne = dataTemp[0],
						lastOne = dataTemp[dataTemp.length - 1];

					dataTemp = [lastOne,...dataTemp,firstOne];
				}
				let carouselList = $('.J_carousel-list',this.el),
					paginationList = $('.J_pagination-list',this.el);

				let dataLen = dataTemp.length;
				this.CarLen = dataLen;
				let tplTemp = this.carouselItemTpl ? this.carouselItemTpl : _carouselItemTpl,
					carouselStr = '',
					paginationStr = '';

				for(let i = 0; i< dataLen; i++){
					carouselStr += tplReplace(tplTemp,dataTemp[i]);
					// paginationStr += tplReplace(_paginationItemTpl,{isActive:i === 0 ? 'active' : ''});
					if(this.infinite){
						i < dataLen -2 && (paginationStr += tplReplace(_paginationItemTpl,{isActive:i === 0 ? 'active' : ''}));
					}else{
						paginationStr += tplReplace(_paginationItemTpl,{isActive:i === 0 ? 'active' : ''});
					}
				}
				carouselList.append(carouselStr);
				paginationList.append(paginationStr);
			}
		}
	}

	class Carousel{
		constructor(args){
			this.name = 'Carousel';

			config(this,args);

			this.init(args);
		}

		renderPagination(){
			let paginationWrap = $('.J_pagination-wrap',this.el);//缓存一下

			paginationWrap.addClass('show'); 
			this.carDir === 'column' && paginationWrap.addClass('column');
		}

		setcarDir(){
			// 设置方向
			this.carDir === 'row' 
				?	$(this.el).addClass('row')
				:	$(this.el).addClass('column'); 
		}
		setInitOffset(){
			let widthTemp = window.innerWidth;
			let heightTemp = $(this.el).height();
			this.carDir === 'row' 
				?	$('.J_carousel-list',this.el).css('transform',`translate3d(${-widthTemp}px,0,0)`)
				: 	$('.J_carousel-list',this.el).css('transform',`translate3d(0,${-heightTemp}px,0)`);
		}
		async render(){
			this.infinite && (this.curPage = 1);
			// await this.renderCarousel();
			await render.carousel.call(this);
			this.infinite && this.setInitOffset();
			this.paginationShow && this.renderPagination();
			this.setcarDir();
			// this.autoPlay();
		}

		autoPlay(){
			this.autoDir = 'right';
			this.autoTimer = setInterval(()=>{
				// if(this.curPage)
				if(this.infinite){
					this.curPage++;
					// console.log(this.curPage);
					if(this.curPage !== this.CarLen - 2){
						this.scroll(this.carDir,this.curPage);
					}else{
						this.scroll(this.carDir,this.curPage);
						setTimeout(()=>{
							this.curPage = 0;
							this.moveImmediately(this.carDir,this.curPage);
						},600);
					}
				}else{
					console.log(this.curPage);
					if(this.curPage == this.CarLen - 1 ){
						this.autoDir = 'left';
					}
					if(this.curPage == 0){
						this.autoDir = 'right';
					}
					this.autoDir === 'left' ? this.curPage-- : this.curPage++;
					this.scroll(this.carDir,this.curPage);
				}
				
			},2000)
		}
		moveFollowTouch(dir,val){
			let oList = $(".J_carousel-list",this.el);
			dir === 'row' 
				? oList.css('transform',`translate3d(${val}px,0,0)`) 
				: oList.css('transform',`translate3d(0,${val}px,0)`);
		}
		moveImmediately(dir,page){
			let list = $('.J_carousel-list',this.el);

			let widthTemp = window.innerWidth;
			let heightTemp = $(this.el).height();
			// 关闭transition
			list.css('transition','transform 0s linear');

			dir === 'row' 
				? list.css('transform',`translate3d(${-(widthTemp * page)}px,0,0)`) 
				: list.css('transform',`translate3d(0,${-(heightTemp * page)}px,0)`);

		}
		scroll(dir,page){
			let list = $('.J_carousel-list',this.el);
			let widthTemp = window.innerWidth;
			let heightTemp = $(this.el).height();

			list.css('transition','transform .6s ease');

			dir === 'row' 
				? list.css('transform',`translate3d(${-(widthTemp * page)}px,0,0)`) 
				: list.css('transform',`translate3d(0,${-(heightTemp * page)}px,0)`);

		}

		bindEvent(){
			// this.paginationShow && bindPaginationEvent();

			$(".J_carousel-list",this.el).on('touchstart', Touch.start.bind(this));
			$(".J_carousel-list",this.el).on('touchmove', Touch.move.bind(this));
			$(".J_carousel-list",this.el).on('touchend', Touch.end.bind(this));
		}

		async init(){
			await this.render();
			// console.log(this)

			this.bindEvent();
		}
	}



	window.Carousel = Carousel;
}());