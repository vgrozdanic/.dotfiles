return {
  {
    "ojroques/nvim-osc52",
    keys = {
      {
        "<leader>y",
        function()
          require("osc52").copy_operator()
        end,
        expr = true,
        desc = "Copy with OSC52"
      },
      {
        "<leader>yy",
        "<leader>y_",
        remap = true,
        desc = "Copy line with OSC52"
      },
      {
        "<leader>y",
        function()
          require("osc52").copy_visual()
        end,
        mode = "v",
        desc = "Copy selection with OSC52"
      },
    },
    opts = {
      max_length = 0,      -- Maximum length of selection (0 for no limit)
      silent = false,      -- Disable message on successful copy
      trim = false,        -- Trim surrounding whitespaces before copy
    },
  },
}