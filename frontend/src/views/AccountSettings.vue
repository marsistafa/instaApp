<template>
    <div class="accountsettings">
      <h2>Settings</h2>
      <form @submit.prevent="submitSettings">
        <div>
          <label for="postsLimit">Number of Posts Limit</label>
          <input type="number" id="postsLimit" v-model="settings.postsLimit" min="1">
        </div>
        <div>
          <label for="schedule">Timetable Schedule per Post</label>
          <input type="time" id="schedule" v-model="settings.schedule">
        </div>
        <div>
          <label for="pageNames">Add Page Names</label>
          <input type="text" id="pageNames" v-model="settings.pageNames">
        </div>
        <button type="submit">Save Settings</button>
      </form>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        settings: {
          postsLimit: 5, // Default or fetched from a store/server
          schedule: '08:00', // Default or fetched
          pageNames: '', // Default or fetched
        },
      };
    },
    methods: {
      submitSettings() {
        console.log('Settings submitted:', this.settings);
        // Here you would typically send the settings to your backend to be saved
      },
    },
  };
  </script>
  
  <style scoped>
  /* Add your CSS styling here */
  </style>
  