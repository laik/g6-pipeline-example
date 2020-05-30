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


  React.useEffect(() => {

    const data = {
      nodes: [
        {
          id: '1', x: 50, y: 100,
        },
      ],
      edges: [

      ]
    };


    const graph = new G6.Graph({
      container: 'container',
      width: 1200,
      height: 800,
      renderer: 'svg',
      modes: {
        default: ['drag-node'],
        edit: ['click-select'],
        // addEdge: ['click-add-edge', 'click-select'],
      },
      defaultEdge: {
        type: 'line',
        style: {
          // stroke: #fff,
          endArrow: true,
          lineWidth: 1,
        },
        // 其他配置
      },
      defaultNode: {
        type: 'pipeline-node',
        size: [120, 40],
        linkPoints: {
          top: true,
          bottom: true,
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
      console.log('------------------------------>mouseenter');
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
        const source = item._cfg.id;
        const target = Number(source) + 1;

        const model = item.getModel()
        const { x, y } = model
        const point = graph.getCanvasByPoint(x, y)
        graph.addItem('node',
          {
            id: target.toString(),
            // title: 'Task' + target,
            x: Number(point.x) + 200,
            y: Number(point.y),

          },
        );

        graph.addItem('edge', {
          source: model.id,
          target: target.toString(),
          sourceAnchor: 0,
          targetAnchor: 10,
        });

        graph.addItem('edge', {
          source: target.toString(),
          target: model.id,
          sourceAnchor: 0,
          targetAnchor: 10,
        });
      }


      if (shape === 'bottom-plus') {
        const source = item._cfg.id;
        const target = Number(source) + 10;

        const model = item.getModel()
        const { x, y } = model
        const point = graph.getCanvasByPoint(x, y)
        graph.addItem('node',
          {
            id: target.toString(),
            x: Number(point.x) + 200,
            y: Number(point.y) + 200,

          },
        );

        graph.addItem('edge', {
          source: model.id,
          target: target.toString(),
          sourceAnchor: 0,
          targetAnchor: 10,
        });

        graph.addItem('edge', {
          source: target.toString(),
          target: model.id,
          sourceAnchor: 0,
          targetAnchor: 10,
        });
      }

    });

  });
  return (
    <div id="container"></div>
  );
}

export default Example