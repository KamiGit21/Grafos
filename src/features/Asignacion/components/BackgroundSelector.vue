<template>
  <div class="background-selector">
    <div class="selector-group">
      <button 
        @click="$emit('set-background', 'grid')" 
        :class="{ 'active': canvasBackgroundStyle === 'grid' }"
        class="bg-btn"
        title="Fondo de Cuadrícula"
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 3V21M21 3V21M3 3H21M3 9H21M3 15H21M3 21H21M9 3V21M15 3V21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
      
      <button 
        @click="$emit('set-background', 'dots')" 
        :class="{ 'active': canvasBackgroundStyle === 'dots' }"
        class="bg-btn"
        title="Fondo de Puntos"
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="6" cy="6" r="1.5" fill="currentColor"/>
          <circle cx="12" cy="6" r="1.5" fill="currentColor"/>
          <circle cx="18" cy="6" r="1.5" fill="currentColor"/>
          <circle cx="6" cy="12" r="1.5" fill="currentColor"/>
          <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
          <circle cx="18" cy="12" r="1.5" fill="currentColor"/>
          <circle cx="6" cy="18" r="1.5" fill="currentColor"/>
          <circle cx="12" cy="18" r="1.5" fill="currentColor"/>
          <circle cx="18" cy="18" r="1.5" fill="currentColor"/>
        </svg>
      </button>
      
      <button 
        @click="$emit('set-background', 'blank')" 
        :class="{ 'active': canvasBackgroundStyle === 'blank' }"
        class="bg-btn"
        title="Fondo Blanco"
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="2"/>
          <line x1="4" y1="20" x2="20" y2="4" stroke="currentColor" stroke-width="2"/>
        </svg>
      </button>
    </div>

    <div class="divider-vertical"></div>

    <label class="color-picker-label" title="Color de Fondo">
      <div class="color-preview" :style="{ backgroundColor: canvasBackgroundColor }">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C12 2 5 8 5 13C5 16.866 8.13401 20 12 20C15.866 20 19 16.866 19 13C19 8 12 2 12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <input 
        type="color" 
        :value="canvasBackgroundColor" 
        @input="$emit('update-color', $event.target.value)" 
      />
    </label>
  </div>
</template>

<script setup>
defineProps({
  canvasBackgroundStyle: String,
  canvasBackgroundColor: String
});

defineEmits(['set-background', 'update-color']);
</script>

<style scoped>
.background-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(224, 201, 182, 0.4);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.selector-group {
  display: flex;
  gap: 6px;
  align-items: center;
}

.bg-btn {
  position: relative;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 2px solid rgba(224, 201, 182, 0.3);
  background: rgba(255, 249, 242, 0.8);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.bg-btn svg {
  width: 20px;
  height: 20px;
  color: #8b7355;
  transition: all 0.3s ease;
  z-index: 1;
}

.bg-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.5s ease;
}

.bg-btn:hover::before {
  left: 100%;
}

.bg-btn:hover {
  transform: translateY(-2px) scale(1.05);
  background: rgba(243, 232, 221, 0.95);
  border-color: rgba(201, 168, 135, 0.6);
  box-shadow: 0 4px 12px rgba(139, 115, 85, 0.15);
}

.bg-btn:hover svg {
  color: #6d5940;
  transform: scale(1.1);
}

.bg-btn.active {
  background: linear-gradient(135deg, #e0c9b6 0%, #d4baaa 100%);
  border-color: #c9b4a4;
  box-shadow: 
    0 4px 12px rgba(139, 115, 85, 0.2),
    inset 0 2px 4px rgba(255, 255, 255, 0.3);
}

.bg-btn.active svg {
  color: #5a4638;
  transform: scale(1.05);
}

.divider-vertical {
  width: 1px;
  height: 28px;
  background: linear-gradient(180deg, transparent, rgba(224, 201, 182, 0.4), transparent);
}

.color-picker-label {
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.color-preview {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 2px solid rgba(224, 201, 182, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.color-preview::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.color-picker-label:hover .color-preview::before {
  left: 100%;
}

.color-preview svg {
  width: 18px;
  height: 18px;
  color: rgba(255, 255, 255, 0.9);
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
  z-index: 1;
  transition: transform 0.3s ease;
}

.color-picker-label:hover .color-preview {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.color-picker-label:hover .color-preview svg {
  transform: scale(1.15);
}

.color-picker-label input[type="color"] {
  position: absolute;
  opacity: 0;
  width: 36px;
  height: 36px;
  cursor: pointer;
}

/* Dark Theme */
.dark-theme .background-selector {
  background: rgba(44, 44, 44, 0.95);
  border-color: rgba(70, 70, 70, 0.5);
}

.dark-theme .bg-btn {
  background: rgba(58, 58, 58, 0.8);
  border-color: rgba(70, 70, 70, 0.5);
}

.dark-theme .bg-btn svg {
  color: #c9b4a4;
}

.dark-theme .bg-btn:hover {
  background: rgba(74, 74, 74, 0.95);
  border-color: rgba(139, 115, 85, 0.5);
}

.dark-theme .bg-btn:hover svg {
  color: #e0c9b6;
}

.dark-theme .bg-btn.active {
  background: linear-gradient(135deg, #666565 0%, #555555 100%);
  border-color: #777777;
}

.dark-theme .bg-btn.active svg {
  color: #f5e6d3;
}

.dark-theme .divider-vertical {
  background: linear-gradient(180deg, transparent, rgba(70, 70, 70, 0.4), transparent);
}

.dark-theme .color-preview {
  border-color: rgba(70, 70, 70, 0.6);
}
</style>