# 插件说明

**代码还未进一步优化。**

## 插件初始化

```javascript
new Tree({
    container: treeContainer,	//树组件的容器div
    confirmBtn: confirmBtn,		//确认按钮
    selectedInfo: selectedInfo,	//选择信息
    data: treeData,				//树组件数据
    outerCanFold:false,			//最外层是否可折叠，默认不可折叠，为可选属性
    childrenOpenWhenCheckAll:false, //全选时是否展开所有子元素，默认不展开，为可选属性
    mainCheckAllCallback(){		//最外层点击全选的回调，由于我项目中是只有一个最外层，全选时选择的数据太多，所以添加了个回调来询问是否全选
        console.log('最外层的全选');
    },
    confirmCallback(selectedData,afterTreeData){		//确认按钮点击的回调
        console.log('当前选中的元素: ',selectedData);
        console.log('点击确认之后原始数据中选中的数据checked值被修改: ',afterTreeData);
    }
})
```

## 方法：

### init(opt);

​	**初始化**的方法，包含：

- 初始化数据。
- 调用render方法渲染树。
- 调用On方法绑定事件。

### render(treeData);

​	**渲染结构**的方法

​	由于是针对于项目需求写的组件，所以实现的目标为：根据数据渲染出对应的单位树组件；所以render方法需要获取当前需要渲染的数据。

由于每个节点的dom结构为左侧全选按钮，右侧节点名称，右边icon使用伪类来写的，所以点击时只要判断时全选按钮点击还是



### 内部事件处理函数

#### handleClick()

处理树的点击

处理逻辑为：

- 判断当前点击的节点是否有子节点
  - 有
    - 判断点击的是节点左侧的全选按钮还是右侧的部分
      - 左侧全选按钮：子节点全部选中，子元素全部展开（可选）
      - 右侧部分：展开相邻层级的子节点（并不会将子节点的子节点也展开）
  - 无，选中当前节点。
- 树的最外面一层无法折叠，原因是因为项目中只有一个最外层节点，所以默认展开并且不可折叠。(可设置)

当点击一个节点（非父节点时）：

- 子节点展开，子节点icon旋转

- 计算选中的个数，修改底部的提示
- 判断父节点选中的情况，将选中的状态逐层传递（选中状态联动）

#### handleConfirm()

点击确认按钮之后执行的回调函数。

内部执行：

1. 修改原始数据
2. 获取选中元素的数据
3. 调用外部传入的点击确认执行的回调函数，可以获取到选中的数据的和修改后的数据
   1. 修改后的数据可以保存下来，下次渲染书的时候会通过修改后的数据来判断选中的默认值从而判断选中和展开情况