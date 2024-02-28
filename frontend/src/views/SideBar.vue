<template>
  <div class="sidebar">
    <router-link to="/accountsettings">Settings</router-link>
    <!-- Add more links as needed -->
  </div>
  <router-view/>
</template>


<style scoped>
.sidebar {
  width: 250px;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  background-color: #f4f4f4;
  padding: 20px;
}
</style>
