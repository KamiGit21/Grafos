<template>
    <JohnsonComponent/>
</template>

<script>
    import JohnsonComponent from '../components/JohnsonComponent.vue';
    export default {
        name: 'Johnson',
        components: {
            JohnsonComponent
        },
        data() {
            return {
            buildNumber: Math.floor(Math.random() * 10000)
            }
        },
    };
</script>