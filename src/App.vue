<template>
  <div id="app">
    <DemoTree msg="G6 拓扑图例子, k8s使用helm部署zookeeper的一个图例。"/>
  </div>
</template>

<script>
import DemoTree from './components/DemoTree.vue'

export default {
  name: 'App',
  components: {
    DemoTree
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
