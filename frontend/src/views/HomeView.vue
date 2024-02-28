<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <DashBoard msg="Welcome to Your Vue.js App"/>
    <SideBar/>
  </div>
</template>

<script>
// @ is an alias to /src
import DashBoard from '@/views/DashBoard.vue'
import SideBar from '@/views/SideBar.vue'


export default {
  name: 'HomeView',
  components: {
    DashBoard,
    SideBar,
  }
}
</script>
