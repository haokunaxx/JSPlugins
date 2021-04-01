treeData = [
  {
    title: "一级1",
    id: 1,
    field: "name1",
    children: [
      {
        title: "二级1-1 可允许跳转",
        id: 3,
        field: "name11",
        href: "https://www.layui.com/",
        children: [
          {
            title: "三级1-1-3",
            id: 23,
            field: "",
            children: [
              {
                title: "四级1-1-3-1",
                id: 24,
                field: "",
                children: [
                  {
                    title: "五级1-1-3-1-1",
                    id: 30,
                    field: "",
                    checked: false,
                  },
                  {
                    title: "五级1-1-3-1-2",
                    id: 31,
                    field: "",
                  },
                ],
              },
            ],
          },
          {
            title: "三级1-1-1",
            id: 7,
            field: "",
            children: [
              {
                title: "四级1-1-1-1 可允许跳转",
                id: 15,
                field: "",
                href: "https://www.layui.com/doc/",
              },
            ],
          },
          {
            title: "三级1-1-2",
            id: 8,
            field: "",
            children: [
              {
                title: "四级1-1-2-1",
                id: 32,
                field: "",
                checked:true
              },
            ],
          },
        ],
      },
      {
        title: "二级1-2",
        id: 4,
        children: [
          {
            title: "三级1-2-1",
            id: 9,
            field: "",
            disabled: true,
          },
          {
            title: "三级1-2-2",
            id: 10,
            field: "",
          },
        ],
      },
      {
        title: "二级1-3",
        id: 20,
        field: "",
        children: [
          {
            title: "三级1-3-1",
            id: 21,
            field: "",
          },
          {
            title: "三级1-3-2",
            id: 22,
            field: "",
          },
        ],
      },
    ],
  },
  {
    title: "一级2",
    id: 2,
    field: "",
    children: [
      {
        title: "二级2-1",
        id: 5,
        field: "",
        children: [
          {
            title: "三级2-1-1",
            id: 11,
            field: "",
          },
          {
            title: "三级2-1-2",
            id: 12,
            field: "",
          },
        ],
      },
      {
        title: "二级2-2",
        id: 6,
        field: "",
        children: [
          {
            title: "三级2-2-1",
            id: 13,
            field: "",
          },
          {
            title: "三级2-2-2",
            id: 14,
            field: "",
            disabled: true,
          },
        ],
      },
    ],
  },
  {
    title: "一级3",
    id: 16,
    field: "",
    children: [
      {
        title: "二级3-1",
        id: 17,
        field: "",
        fixed: true,
      },
      {
        title: "二级3-2",
        id: 27,
        field: "",
      },
    ],
  },
];
