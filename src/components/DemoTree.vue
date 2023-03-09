<template>
  <div>
    {{ msg }}
    <div class="demo">
      <div id="mountNode"></div>
    </div>
  </div>
</template>

<script>
import G6 from '@antv/g6';
import {registerFlowLine, registerResourceNode, getEdgesLayer} from "@/common";

export default {
  name: 'DemoTree',
  props: {
    msg: String
  },
  data() {
    return {
      graph: null,
    };
  },
  mounted() {
    this.register();
    this.initTree();
  },
  methods: {
    register() {
      registerResourceNode();
      registerFlowLine();
    },
    initTree() {
      const { data } = this.initData();
      this.graph = this.createTree();
      this.updateSize();
      this.graph.read(data);
      this.graph.zoomTo(0.75, { x: 128, y: 369 }, true, { duration: 10 });
    },
    updateTree() {
      const data = {
        // 点集
        nodes: [
          {
            id: '1',
            label: 'zk',
            kind: 'Helm',
            health: 'Healthy',
            status: 'Synced',
            logoIcon: {
              img: 'https://blazehu.com/images/k8s/status/helm.svg',
              offsetY: 0,
            },
          },
          {
            id: '2',
            label: 'zk-zookeeper',
            kind: 'Service',
            health: 'Healthy',
            status: 'Synced',
          },
          {
            id: '3',
            label: 'zk-zookeeper-headless',
            kind: 'Service',
            health: 'Healthy',
            status: 'Synced',
          },
        ],
        // 边集
        edges: [
          {
            source: '1', // String，必须，起始点 id
            target: '2', // String，必须，目标点 id
          },
          {
            source: '1',
            target: '3',
          },
        ],
      };
      this.graph.changeData(data);
      this.graph.refresh();
    },
    updateSize() {
      const container = document.getElementById('mountNode');
      if (container === null) {
        return;
      }
      const width = container.scrollWidth || window.outerWidth - 90;
      const height = container.scrollHeight || window.outerHeight - 150;
      this.graph.changeSize(width, height);
    },
    initData() {
      const data = {
        // 点集
        nodes: [
          {
            id: '1',
            label: 'zk',
            kind: 'Helm',
            health: 'Healthy',
            status: 'Synced',
            logoIcon: {
              img: 'https://blazehu.com/images/k8s/status/helm.svg',
              offsetY: 0,
            },
          },
          {
            id: '2',
            label: 'zk-zookeeper',
            kind: 'Service',
            health: 'Healthy',
            status: 'Synced',
          },
          {
            id: '3',
            label: 'zk-zookeeper-headless',
            kind: 'Service',
            health: 'Healthy',
            status: 'Synced',
          },
          {
            id: '4',
            label: 'zk-zookeeper',
            kind: 'StatefulSet',
            health: 'Progressing',
            status: 'Synced',
            phase: 'StartSync',
          },
          {
            id: '5',
            label: 'zk-zookeeper',
            kind: 'Endpoints',
          },
          {
            id: '6',
            label: 'zk-zookeeper-k2vpn',
            kind: 'EndpointSlice',
          },
          {
            id: '7',
            label: 'zk-zookeeper-headless',
            kind: 'Endpoints',
          },
          {
            id: '8',
            label: 'zk-zookeeper-headless-7bz9d',
            kind: 'EndpointSlice',
          },
          {
            id: '9',
            label: 'zk-zookeeper-headless-8mbqm',
            kind: 'EndpointSlice',
          },
          {
            id: '10',
            label: 'zk-zookeeper-0',
            kind: 'PersistentVolumeClaim',
            health: 'Healthy',
          },
          {
            id: '11',
            label: 'zk-zookeeper-0',
            kind: 'Pod',
            health: 'Progressing',
          },
          {
            id: '12',
            label: 'zk-zookeeper-565fd5c886',
            kind: 'ControllerRevision',
          }
        ],
        // 边集
        edges: [
          {
            source: '1', // String，必须，起始点 id
            target: '2', // String，必须，目标点 id
          },
          {
            source: '1',
            target: '3',
          },
          {
            source: '1',
            target: '4',
          },
          {
            source: '2',
            target: '5',
          },
          {
            source: '2',
            target: '6',
          },
          {
            source: '3',
            target: '7',
          },
          {
            source: '3',
            target: '8',
          },
          {
            source: '3',
            target: '9',
          },
          {
            source: '4',
            target: '10',
          },
          {
            source: '4',
            target: '11',
          },
          {
            source: '4',
            target: '12',
          },
        ],
      };
      const edgesLayer = getEdgesLayer(data.edges || []);
      const maxLayerCount = Math.max(...Object.values(edgesLayer));
      return { maxLayerCount, data };
    },
    createTree() {
      if (this.graph) {
        this.graph.destroy();
      }
      const container = document.getElementById('mountNode');
      if (container === null) {
        return;
      }
      const width = container.scrollWidth || window.outerWidth - 90;
      const height = container.scrollHeight || window.outerHeight - 150;
      const defaultEdgeStyle = {
        stroke: '#e2e2e2',
        endArrow: {
          path: 'M 0,0 L 8,4 L 8,-4 Z',
          fill: '#e2e2e2',
          stroke: '#bae7ff',
          lineWidth: 2,
        },
      };
      const defaultNodeStyle = {
        stroke: '#00000000',
        shadowColor: '#ccd6dd',
        shadowOffsetX: 1,
        shadowOffsetY: 1,
        shadowBlur: 1,
        fill: '#fff',
        cursor: 'pointer',
      };
      const defaultNodeSize = [345, 72]; // [width, height]
      const defaultLogo = {
        width: 32,
        height: 32,
      };
      const graph = new G6.Graph({
        container: 'mountNode',
        width,
        height,
        fitView: true,
        modes: {
          default: [{
            type: 'drag-canvas',
            // ... 其他配置
          }, {
            type: 'scroll-canvas',
            direction: 'y',
            scalableRange: height * -0.5,
            // ... 其他配置
          }],
        },
        layout: {
          type: 'dagre',
          rankdir: 'LR',
          align: 'DL',
          nodesep: 25, // 可选
          ranksep: 60, // 可选
          nodesepFunc: () => 1,
          ranksepFunc: () => 1,
        },
        defaultNode: {
          type: 'resource',
          size: defaultNodeSize,
          style: defaultNodeStyle,
          logoIcon: defaultLogo,
          stateIcon: {
            show: false,
          },
          preRect: {
            show: false,
          },
        },
        defaultEdge: {
          type: 'flow-line', // line、flow-line、circle-running
          style: defaultEdgeStyle,
          size: 1,
          color: '#e2e2e2',
        },
      });
      return graph;
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.demo {
  background: #f5f7fa;
  max-height: calc(100vh - 20px);
  max-width: calc(100vw);
  overflow-x: auto;
  overflow-y: auto;
  padding: 6px;
  margin: 36px;
}
</style>
