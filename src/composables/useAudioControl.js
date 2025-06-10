import { ref, readonly } from "vue";

// Central state for tracking which component is currently playing audio
const activeAudioSource = ref(null);

// Create a composable to provide consistent interface
export function useAudioControl() {
  /**
   * Register a component as the active audio source
   * @param {string} id - Unique identifier for the component
   * @returns {Function} - Function to release audio control
   */
  function requestAudioFocus(id) {
    const previousSource = activeAudioSource.value;
    activeAudioSource.value = id;

    console.log(`Audio focus changed: ${previousSource} -> ${id}`);

    // Return function to release audio control when component is destroyed
    return () => {
      if (activeAudioSource.value === id) {
        activeAudioSource.value = null;
        console.log(`Audio focus released by: ${id}`);
      }
    };
  }

  /**
   * Check if the component currently has audio focus
   * @param {string} id - Component identifier
   * @returns {boolean} - Whether this component has audio focus
   */
  function hasAudioFocus(id) {
    return activeAudioSource.value === id;
  }

  /**
   * Watch for audio focus changes
   * @returns {Ref<string|null>} - Readonly reference to current active audio source
   */
  function getActiveAudioSource() {
    return readonly(activeAudioSource);
  }

  return {
    requestAudioFocus,
    hasAudioFocus,
    getActiveAudioSource,
  };
}
