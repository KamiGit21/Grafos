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
        mounted() {
            this.setupSmoothScrolling()
            this.initializeTheme()
        },
        methods: {
            setupSmoothScrolling() {
            document.documentElement.style.scrollBehavior = 'smooth'
            },
            initializeTheme() {
            const savedTheme = localStorage.getItem('theme') || 'dark-theme'
            this.applyTheme(savedTheme)
            },
            applyTheme(theme) {
            document.body.className = theme
            }
        }
    };
</script>