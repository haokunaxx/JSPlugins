Tree = function(window){
    const doc = window.document;
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
    const _inner = (data,idx) =>{
        let tempStr = '';
        data.forEach(item => {
            let haveChildren = item.children && item.children.length>0;
            tempStr += treeNodeTpl.replace(/{{(.*?)}}/g,(node,key)=>{
                return {
                    treeNodeIdx:idx,
                    haveChildren:haveChildren ? 'parent': '',
                    treeNodeName:item.title,
                    isChecked:item.checked ? ' checked' : '',
                    id:item.id
                }[key]
            })
            haveChildren  && (tempStr+=renderInner(item.children,idx,item.opened));
        })
        return tempStr;
    }
    const renderInner = (data,idx,isOpen) =>{
        let tempStr = '';
        tempStr += `<div class="sub-tree-node sub-tree-node-${idx} ${idx == 1 ? 'open': isOpen?'open':''}">`;
        tempStr += _inner(data,++idx);
        tempStr +='</div>'; 
        return tempStr;
    }

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
    const getAllCheckedChildren = (node) =>{
        let allCheckeds = node.getElementsByClassName('checked'),
            checkedChildren = [].filter.call(allCheckeds,item=>!Utils.has(item,'parent')),
            checkedIdArr = [];
        checkedChildren.forEach(item => checkedIdArr.push(item.dataset.id));
        console.log(checkedIdArr,
            checkedChildren,
            allCheckeds)
        return{
            checkedIdArr,
            checkedChildren,
            allCheckeds
        }
    }
    
    return function(opt){
        let conf = null,
            checkedIdArr = [],
            checkedDataArr = [],
            allCheckeds = [];


        function Config(opt){
            this.el = opt.el;
            this.data = opt.data;
            this.btn = opt.btn;
            this.info = opt.info;
            this.mainCheckAllCallback = opt.mainCheckAllCallback;
            this.confirmCallback = opt.confirmCallback;
        }
        
        function Tree(opt){
            if(!opt){return;}
            conf = new Config(opt);
        }


        Tree.prototype = {
            render(data){
                console.log(data);
                 let domStr = '',
                    idxTemp = 1;
                data.forEach(item => {
                    let haveChildren = item.children && item.children.length>0;
                    domStr += treeNodeTpl.replace(/{{(.*?)}}/g,(node,key)=>{
                        return {
                            treeNodeIdx:idxTemp,
                            haveChildren:haveChildren ? 'parent': '',
                            treeNodeName:item.title,
                            isChecked:item.checked ?' checked':'',
                            id:item.id
                        }[key]
                    })
                    haveChildren && (domStr+=renderInner(item.children,idxTemp,item.open));
                })


                conf.el.innerHTML = domStr;
                let defNodes = conf.el.getElementsByClassName('checked');
                [].forEach.call(defNodes,node=>{
                    setParentNodeOpen(node);
                })
            },
            On(){
                E.on(conf.el,'click',handlers.handleClick);
                E.on(conf.btn,'click',handlers.handleConfirm);
            }
        }

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

                console.log(treeNode,idx);

                if(has(treeNode,'tree-node tree-node-1 parent')){
                    if(!has(tar,'node-check-icon-1')){
                        console.log('????????????');
                        return;
                    }
                };

                if(has(treeNode,'parent')){                                  //??????????????????????????? ??? 1.?????????????????????????????? 2.?????????
                    if(has(treeNode,'tree-node tree-node-1 parent')){
                        conf.mainCheckAllCallback();
                    }   
                    let treeNodeParent = treeNode.parentNode,
                        broSubWrap = treeNodeParent.getElementsByClassName('sub-tree-node-'+endChar)[idx];
                    // ????????????????????????checkIcon???????????? ?????????????????????????????????
                    if(has(tar,'node-check-icon')){
                        console.log('????????????,????????????');
                        let deepSubWraps = broSubWrap.getElementsByClassName('sub-tree-node'),
                            treeNodes = broSubWrap.getElementsByClassName('tree-node'),
                            treeNodesParent = broSubWrap.getElementsByClassName('tree-node parent');

                            
                        if(!has(treeNode,'checked')){
                            add(treeNode,'checked');
                            [].forEach.call(treeNodes,item=>add(item,'checked'));//?????????????????????
                            add(broSubWrap,'open'); 
                            // [].forEach.call(deepSubWraps,item=>add(item,'open'));//?????????????????????
                            add(treeNode,'unfold');
                            ! has(treeNode,'tree-node tree-node-1 parent') && [].forEach.call(treeNodesParent,item=>add(item,'unfold'));//??????????????????????????????
                        }else{
                            del(treeNode,'checked');//????????????????????????
                            [].forEach.call(treeNodes,item=>del(item,'checked'));
                        }

                        parentCheck(treeNode);
                        let temp = getAllCheckedChildren(conf.el);
                        checkedIdArr = temp.checkedIdArr;
                        allCheckeds = temp.allCheckeds;
                        changeBottomInfo();
                        return;
                    }
                    // ?????????
                    if( has(broSubWrap,'open') ){       //??????????????????.replace(' unfold','')
                        del(broSubWrap,'open')          //??????
                        del(treeNode,'unfold')
                        let deepSubWraps = broSubWrap.getElementsByClassName('sub-tree-node'),
                            deepTreeNodes = broSubWrap.getElementsByClassName('tree-node');
                        
                        [].forEach.call(deepSubWraps,item=>del(item,'open') );
                        [].forEach.call(deepTreeNodes,item=>del(item,'unfold') );
                    }else{
                        add(broSubWrap,'open')          //??????
                        add(treeNode,'unfold')
                    }

                }else{                              //???????????? ??????????????????
                    has(treeNode,'checked') ? del(treeNode,'checked') : add(treeNode,'checked');
                    parentCheck(treeNode);
                    let temp = getAllCheckedChildren(conf.el);
                    checkedIdArr = temp.checkedIdArr;
                    allCheckeds = temp.allCheckeds;
                    changeBottomInfo();
                }
            },
            handleConfirm(){
                modifyTreeData();
                checkedDataArr = [];
                checkedIdArr.forEach(item=>{
                    getCheckedData(item,conf.data);     //????????????????????? ???????????????form????????????
                })
                console.log(checkedDataArr);
                conf.confirmCallback(checkedDataArr,conf.data);
            }
        }
        const setParentNodeOpen = (node) => {
            let parentNode = node.parentNode;
            if(Utils.has(parentNode,'tree-node-1'))return;
            !Utils.has(parentNode,'open') && Utils.add(parentNode,' open');
            setParentNodeOpen(parentNode);
        }
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
        const changeBottomInfo = () => {         //????????????????????????
            conf.info.innerHTML = `?????????${checkedIdArr.length}?????????,??????????????????`;
        }

        const modifyTreeData = () => {           //????????????
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
            // console.log(allCheckeds);
            [].forEach.call(allCheckeds,item=>_inner(item.dataset.id,conf.data));
            // console.log(conf.data);
        }
        const tree =  new Tree(opt)
        tree.render(conf.data);
        tree.On();
        return tree;
    }

}(this);