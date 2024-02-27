<template>
  <div class="dashboard">
    <div class="widget">Widget 1</div>
    <div class="widget">Widget 2</div>
    <!-- Add more widgets as needed -->
  </div>
</template>

<style scoped>
.dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px;
}
.widget {
  background-color: white;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      data: null,
    };
  },
  async mounted() {
    const response = await axios.get('/');
    this.data = response.data;
  },
};
</script>
