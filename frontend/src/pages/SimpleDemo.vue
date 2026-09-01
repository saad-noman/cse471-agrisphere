<template>
  <div>
    <h1>My Demo</h1>

    <button @click="loadUser">
      Get My Name
    </button>

    <p v-if="name">
      Hello, {{ name }}!
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { getDemo } from '../services/demoService';

const name = ref('');

const loadUser = async () => {
  try {
    const response = await getDemo();

    name.value = response.data.name;
  } catch (error) {
    console.error(error);
  }
};
</script>
