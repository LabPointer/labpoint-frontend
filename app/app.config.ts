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
            base: "rounded-md bg-neutral-100 ring-neutral-300 shadow-md"
        }
    },

    selectMenu: {
        slots: {
            base: "ring-3 ring-neutral-300 hover:ring-neutral-400 shadow-md cursor-pointer",
            item: "cursor-pointer"
        }
    },
    navigationMenu: {
      slots: {
        link: "data-active:bg-neutral-100 dark:data-active:bg-white/10 data-active:shadow-inner rounded-lg data-active:text-indigo-600 dark:data-active:text-indigo-100 text-neutral-600 hover:text-neutral-800",
      }
    }    
  }
})