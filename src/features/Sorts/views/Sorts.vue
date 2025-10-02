<template>
    <BubbleSortVisualizer/>
</template>

<script>
    import BubbleSortVisualizer from '../components/BubbleSortVisualizer.vue';
    export default {
        name: 'Sorts',
        components: {
            BubbleSortVisualizer
        },
        data() {
            return {
            buildNumber: Math.floor(Math.random() * 10000)
            }
        },
    };
</script>