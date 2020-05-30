import G6 from '@antv/g6';
import * as React from 'react';
import './registerShape';




const Example: React.FC = () => {  // 边tooltip坐标

  // 边tooltip坐标
  const [showEdgeTooltip, setShowEdgeTooltip] = React.useState(false);
  const [edgeTooltipX, setEdgeTooltipX] = React.useState(0)
  const [edgeTooltipY, setEdgeTooltipY] = React.useState(0)
  // 节点tooltip坐标
  const [showNodeTooltip, setShowNodeTooltip] = React.useState(false)
  const [nodeTooltipX, setNodeToolTipX] = React.useState(0)
  const [nodeTooltipY, setNodeToolTipY] = React.useState(0)

  // 节点ContextMenu坐标
  const [showNodeContextMenu, setShowNodeContextMenu] = React.useState(false)
  const [nodeContextMenuX, setNodeContextMenuX] = React.useState(0)
  const [nodeContextMenuY, setNodeContextMenuY] = React.useState(0)

  const data = {
    nodes: [
      {
        id: '1-1',
        x: 50,
        y: 100,
        anchorPoints: [[0, 0.5], [1, 0.5]]
      },
    ],
    edges: [

    ]
  };

  React.useEffect(() => {
    const graph = new G6.Graph({
      container: 'container',
      width: 1200,
      height: 800,
      renderer: 'svg',
      modes: {
        // default: ['drag-node'],
        // edit: ['click-select'],
        // addEdge: ['click-add-edge', 'click-select'],
      },
      defaultEdge: {
        type: 'line-arrow',
        style: {
          // stroke: #fff,
          // endArrow: true,
          lineWidth: 1,
        },
        // 其他配置
      },
      defaultNode: {
        type: 'pipeline-node',
        size: [120, 40],
        linkPoints: {
          top: false,
          bottom: false,
          left: true,
          right: true,
          fill: '#fff',
          size: 5,
        },
      },
      nodeStateStyles: {
        hover: {
          fillOpacity: 0.1,
          lineWidth: 2,
        },
      },
    });

    const bindEvents = () => {
      // 监听edge上面mouse事件
      graph.on('edge:mouseenter', (evt: { item: any; target: any; }) => {
        const { item, target } = evt
        // debugger
        const type = target.get('type')
        if (type !== 'text') {
          return
        }
        const model = item.getModel()
        const { endPoint } = model
        // y=endPoint.y - height / 2，在同一水平线上，x值=endPoint.x - width - 10
        const y = endPoint.y - 35
        const x = endPoint.x - 150 - 10
        const point = graph.getCanvasByPoint(x, y)
        setEdgeTooltipX(point.x)
        setEdgeTooltipY(point.y)
        setShowEdgeTooltip(true)
      })

    }




    graph.data(data);
    graph.setMode('addEdge');
    graph.render();

    // 监听鼠标进入节点事件
    graph.on('node:mouseenter', (evt: { item: any; }) => {
      const node = evt.item;
      // 激活该节点的 hover 状态
      graph.setItemState(node, 'hover', true);
    });

    // 监听鼠标离开节点事件
    graph.on('node:mouseleave', (evt: { item: any; }) => {
      const node = evt.item;
      // 关闭该节点的 hover 状态
      graph.setItemState(node, 'hover', false);
    });

    graph.on('node:click', (evt: any) => {
      const { item } = evt;
      const shape = evt.target.cfg.name;

      if (shape === 'right-plus') {
        const source = item._cfg.id.split('-');
        const targetGroup = Number(source[0]) + 1;
        const targeNode = 1;
        const target = targetGroup + '-' + targeNode;

        const model = item.getModel()
        const { x, y } = model
        const point = graph.getCanvasByPoint(x, y)
        graph.addItem('node',
          {
            id: target.toString(),
            x: Number(point.x) + 120,
            y: Number(point.y),
          },
        );

        graph.addItem('edge', {
          source: target.toString(),
          target: model.id,
        });
      }


      // 添加子的时候,需要关联边到当前source 的创建者,与被创建者
      if (shape === 'bottom-plus') {
        const source = item._cfg.id.split('-');
        const group = source[0];
        const targeNode = Number(source[1]) + 1;
        const target = group + '-' + targeNode;
        const model = item.getModel()
        const { x, y } = model
        const point = graph.getCanvasByPoint(x, y)
        graph.addItem('node',
          {
            id: target.toString(),
            x: Number(point.x),
            y: Number(point.y) + 50,
          },
        );
        //添加第二组节点到第一组开始
        graph.addItem('edge', {
          source: target.toString(),
          target: model.id,
        });
        // graph.addItem('edge', {
        //   source: target.toString(),
        //   target: Number(group) - 1 + '-' + 1,
        //   shape: 'cubic-vertical',
        //   sourceAnchor: 0,
        //   targetAnchor: 0
        // });

        // graph.addItem('edge', {
        //   source: target.toString(),
        //   target: Number(group) + 1 + '-' + 1,
        //   shape: 'cubic-vertical',
        //   sourceAnchor: 0,
        //   targetAnchor: 0
        // });

      }
    });

  });
  return (
    <div id="container"></div>
  );
}

export default Example