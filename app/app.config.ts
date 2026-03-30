export default defineAppConfig({
  ui: {
    colors: {
      primary: 'indigo',
      neutral: 'neutral',
    },
    colorMode: {
      preference: 'light',
    },

    input: {
        slots: {
            base: "rounded-full bg-neutral-100 ring-neutral-300 shadow-md"
        }
    },

    selectMenu: {
        slots: {
            base: "ring-3 ring-neutral-300 hover:ring-neutral-400 shadow-md",
        }
    },

    
  }
})