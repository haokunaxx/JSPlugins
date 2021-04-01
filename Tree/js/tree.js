Tree = function(){
    const E = {
        on:function(el,type,handler){
            el.addEventListener ?
                el.addEventListener(type,handler,false) :
            el.attachEvent ?
                el.attachEvent('on'+type,fn) :
            el['on'+type] = fn;
        },
        evt:function(e){
            return e || window.event;
        }
    };
    const Utils = {
        has(tar,clazz){
            return tar.className.indexOf(clazz) !== -1;
        },
        add(tar,clazz){
            tar.className = tar.className.indexOf(clazz) === -1 ? tar.className+' '+ clazz : tar.className;
        },
        del(tar,clazz){
            tar.className.indexOf(clazz) !== -1 && (tar.className = tar.className.replace(clazz,'').replace(/\s+$/,''));
        }
    };
    
    let treeNodeTpl = `
        <div class="tree-node tree-node-{{treeNodeIdx}} {{haveChildren}} {{isChecked}}" data-id = {{id}}>
            <p class="node-check-icon-{{treeNodeIdx}}"></p>
            <p class="node-text node-text-{{treeNodeIdx}}">{{treeNodeName}}</p>
        </div>`;
    
    return function(opt){
        let checkedIdArr = [],
            checkedDataArr = [],
            allCheckeds = [];

        
        function Tree(opt){
            if(!opt){return;}
            this.init(opt);
        }


        Tree.prototype = {
            init(opt){
                this.container =  opt.container;
                this.data = opt.data;
                this.confirmBtn = opt.confirmBtn;
                this.selectedInfo = opt.selectedInfo;
                this.mainCheckAllCallback = opt.mainCheckAllCallback || null;
                this.confirmCallback = opt.confirmCallback || null;
                this.outerCanFold = opt.outerCanFold || false;
                this.childrenOpenWhenCheckAll = opt.childrenOpenWhenCheckAll || false;
                console.log(this);

                this.render(this.data,treeNodeTpl);
                this.On();
            },
            render(data,tpl){
                tplToDom(data,tpl,this);    //渲染页面
                setDefaultOpen(this);   //设置选中的默认展开
            },
            On(){
                E.on(this.container,'click',handlers.handleClick.bind(this));
                E.on(this.confirmBtn,'click',handlers.handleConfirm.bind(this));
            }
        }
        //事件处理函数
        const handlers = {
            handleClick(ev){
                const { has ,add, del} = Utils;
                const e = E.evt(ev),
                    tar = e.target || e.scrElement;

                let treeNode = tar.parentNode;
                    treeNodeClazz = treeNode.className.replace(' parent','').replace(' unfold','').replace(/\s+$/,'');         
                    endChar = treeNodeClazz.replace(' checked','').replace(/\s+$/,'').slice(-1);
                    haveChildren = has(treeNode,'parent');
                    idx = [].indexOf.call(treeNode.parentNode.getElementsByClassName(treeNode.className.replace(' unfold','').replace(' checked','')),treeNode);

                if(has(treeNode,'tree-node tree-node-1 parent')&&!this.outerCanFold){
                    if(!has(tar,'node-check-icon-1')){
                        console.log('无效点击');
                        return;
                    }
                };

                if(has(treeNode,'parent')){                                  //有子元素的点击事件 ： 1.全选（全选包含展开） 2.仅展开
                    if(has(treeNode,'tree-node tree-node-1 parent')){
                        this.mainCheckAllCallback && this.mainCheckAllCallback();
                    }   
                    let treeNodeParent = treeNode.parentNode,
                        broSubWrap = treeNodeParent.getElementsByClassName('sub-tree-node-'+endChar)[idx];
                    // 存在子元素，点击checkIcon表示全选 ，全选（全选包含展开）
                    if(has(tar,'node-check-icon')){
                        console.log('执行全选,并且展开');
                        let deepSubWraps = broSubWrap.getElementsByClassName('sub-tree-node'),
                            treeNodes = broSubWrap.getElementsByClassName('tree-node'),
                            treeNodesParent = broSubWrap.getElementsByClassName('tree-node parent');

                            
                        if(!has(treeNode,'checked')){
                            add(treeNode,'checked');
                            [].forEach.call(treeNodes,item=>add(item,'checked'));//子元素全部选中
                            if(this.childrenOpenWhenCheckAll){
                                add(broSubWrap,'open'); 
                                [].forEach.call(deepSubWraps,item=>add(item,'open'));//子元素全部展开
                            }
                            add(treeNode,'unfold');
                            ! has(treeNode,'tree-node tree-node-1 parent') && [].forEach.call(treeNodesParent,item=>add(item,'unfold'));//子元素是父元素则翻转
                        }else{
                            del(treeNode,'checked');//子元素全部不选中
                            [].forEach.call(treeNodes,item=>del(item,'checked'));
                        }

                        parentCheck(treeNode);
                        let temp = getAllCheckedChildren(this.container);
                        checkedIdArr = temp.checkedIdArr;
                        allCheckeds = temp.allCheckeds;
                        changeBottomInfo(this);
                        return;
                    }
                    // 仅展开
                    if( has(broSubWrap,'open') ){       //当前是展开的.replace(' unfold','')
                        del(broSubWrap,'open')          //收起
                        del(treeNode,'unfold')
                        let deepSubWraps = broSubWrap.getElementsByClassName('sub-tree-node'),
                            deepTreeNodes = broSubWrap.getElementsByClassName('tree-node');
                        
                        [].forEach.call(deepSubWraps,item=>del(item,'open') );
                        [].forEach.call(deepTreeNodes,item=>del(item,'unfold') );
                    }else{
                        add(broSubWrap,'open')          //展开
                        add(treeNode,'unfold')
                    }

                }else{                              //无子元素 点击代表选中
                    has(treeNode,'checked') ? del(treeNode,'checked') : add(treeNode,'checked');
                    parentCheck(treeNode);
                    let temp = getAllCheckedChildren(this.container);
                    checkedIdArr = temp.checkedIdArr;
                    allCheckeds = temp.allCheckeds;
                    changeBottomInfo(this);
                }
            },
            handleConfirm(){
                const _self = this;

                modifyTreeData(_self);
                let temp = getAllCheckedChildren(this.container);
                checkedIdArr = temp.checkedIdArr;
                checkedDataArr = [];
                checkedIdArr.forEach(item=>{
                    getCheckedData(item,_self.data);     //获取选中的元素 用于返回给form表单页面
                })
                
                _self.confirmCallback && _self.confirmCallback(checkedDataArr,_self.data);
            }
        }

        const tplToDom = (data,tpl,self) => {
            const treeNodeTpl = tpl,
                REG = /{{(.*?)}}/g;
            // 渲染sub-node-wrap
            const renderSubNodeWrap = (data,idx) =>{
                let tempStr = '';
                tempStr += `<div class="sub-tree-node sub-tree-node-${idx} ${idx == 1 ? 'open':''}">`;
                tempStr += renderTreeNode(data,++idx);
                tempStr +='</div>'; 
                return tempStr;
            }
            // 渲染tree-node
            const renderTreeNode = (data,idx) =>{
                let tempStr = '';
                data.forEach(item => {
                    let haveChildren = item.children && item.children.length>0;
                    tempStr += treeNodeTpl.replace(REG,(node,key)=>{
                        return {
                            treeNodeIdx:idx,
                            haveChildren:haveChildren ? 'parent': '',
                            treeNodeName:item.title,
                            isChecked:item.checked ? ' checked' : '',
                            id:item.id
                        }[key]
                    })
                    haveChildren  && (tempStr+=renderSubNodeWrap(item.children,idx));
                })
                return tempStr;
            }

            let domStr = renderTreeNode(data,1);
            self.container.innerHTML = domStr;
        }
        // 设置默认选中的节点展开
        const setDefaultOpen = (self) => {
            //设置选中的节点默认展开
            const setCheckedNodesOpen = () => {     
                let defNodes = self.container.getElementsByClassName('checked');
                [].forEach.call(defNodes,node=>{
                    setParentNodeOpen(node);
                    parentCheck(node);
                })
            } 
            // 设置当前选中的元素的父元素展开
            const setParentNodeOpen = (node) => {
                const {has,add} = Utils;
                let parentNode = node.parentNode;
                if(has(parentNode,'tree-node-1')) return;
                !has(parentNode,'open') && add(parentNode,' open');
                setParentNodeOpen(parentNode);
            }
            setCheckedNodesOpen();
        }
        // 父节点选中状态检测
        const parentCheck = (node) => {
            if(Utils.has(node,'tree-node-1'))return;
            let subWrap = node.parentNode,
                subWrapParent = subWrap.parentNode,
                idx = [].indexOf.call(subWrapParent.getElementsByClassName('sub-tree-node'),subWrap);
            let treeNode = subWrapParent.getElementsByClassName('tree-node parent')[idx];
            let checkedLen = subWrap.getElementsByClassName('tree-node checked').length,
                treeNodeLen  = subWrap.getElementsByClassName('tree-node').length;
            if(checkedLen === treeNodeLen){
                Utils.add(treeNode,'checked');
            }else{
                Utils.del(treeNode,'checked');
            }
            parentCheck(treeNode);
        } 
        // 获取所有选中元素相关的数据，包括选中的节点id组成的数组、选中的节点数组（非父节点），所有选中的节点数组
        const getAllCheckedChildren = (node) =>{
            let allCheckeds = node.getElementsByClassName('checked'),
                checkedChildren = [].filter.call(allCheckeds,item=>!Utils.has(item,'parent')),
                checkedIdArr = [];
            checkedChildren.forEach(item => checkedIdArr.push(item.dataset.id));
            return{
                checkedIdArr,
                checkedChildren,
                allCheckeds
            }
        }
        // 根据id获取选中元素对应的数据
        const getCheckedData = (id,arr) => {
            for(let i = 0,len = arr.length;i<len;i++){
                if(arr[i].id == id){
                    checkedDataArr.push(arr[i]);
                    break;
                }else if(arr[i].children && arr[i].children.length>0){
                    getCheckedData(id,arr[i].children);
                }
            }
        }
        // 修改底部的数据
        const changeBottomInfo = (self) => {         //修改底部提示信息
            self.selectedInfo.innerHTML = `已选择${checkedIdArr.length}个单位,点击查看详情`;
        }
        // 修改数据
        const modifyTreeData = (self) => {           //修改数据
            const _inner = (id,data) =>{
                for(let i = 0,len = data.length; i<len; i++){
                    if(data[i].id == id){
                        data[i].checked = true;
                        break;
                    }else if(data[i].children&&data[i].children.length>0){
                        _inner(id,data[i].children);
                    }
                }
            }
            [].forEach.call(allCheckeds,item=>_inner(item.dataset.id,self.data));
        }
        const tree =  new Tree(opt)
        return tree;
    }

}();