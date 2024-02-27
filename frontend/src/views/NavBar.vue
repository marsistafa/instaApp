<template>
  <nav class="navbar">
    <div class="logo">Your Logo</div>
    <ul class="nav-links">
      <li><router-link to="/">Home</router-link></li>
      <li><router-link to="/about">About</router-link></li>
      <!-- Add more links as needed -->
    </ul>
    <div class="actions">
      <router-link to="/account">Account</router-link>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #333;
  color: white;
}
.nav-links li {
  display: inline;
  margin: 0 10px;
}
.nav-links li a {
  color: white;
  text-decoration: none;
}
</style>
