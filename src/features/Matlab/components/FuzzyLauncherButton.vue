<template>
  <button @click="abrirFuzzy" class="btn">
    Abrir Fuzzy Designer
  </button>
</template>

<script>
export default {
  methods: {
    async abrirFuzzy() {
      try {
        const res = await fetch('http://localhost:3000/abrir-fuzzy');
        const text = await res.text();
        alert(text);
      } catch (err) {
        console.error(err);
        alert('No se pudo abrir MATLAB Fuzzy Designer');
      }
    }
  }
}
</script>

<style scoped>
.btn {
  padding: 10px 20px;
  background-color: #0078d7;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.btn:hover {
  background-color: #005fa3;
}
</style>
