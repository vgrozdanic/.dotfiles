return {
  {
    "folke/trouble.nvim",
    cmd = "Trouble",
    opts = {},
    keys = {
      { "<leader>xx", "<cmd>Trouble diagnostics toggle filter.buf=0<cr>", desc = "Document Diagnostics (Trouble)" },
      { "<leader>xX", "<cmd>Trouble diagnostics toggle<cr>", desc = "Workspace Diagnostics (Trouble)" },
      { "<leader>xL", "<cmd>Trouble loclist toggle<cr>", desc = "Location List (Trouble)" },
      { "<leader>xQ", "<cmd>Trouble qflist toggle<cr>", desc = "Quickfix List (Trouble)" },
      { "<leader>xm", "<cmd>messages<cr>", desc = "Show All Messages" },
      { "<leader>xM", "<cmd>messages clear<cr>", desc = "Clear Messages" },
      { "<leader>xl", "<cmd>Lazy check<cr>", desc = "Lazy Check" },
      { "<leader>xL", "<cmd>Lazy log<cr>", desc = "Lazy Log" },
      { "<leader>xh", "<cmd>checkhealth<cr>", desc = "Check Health" },
      { "<leader>xd", "<cmd>checkhealth vim.deprecated<cr>", desc = "Check Deprecated" },
      { "<leader>xi", "<cmd>LspInfo<cr>", desc = "LSP Info" },
      { "<leader>xI", "<cmd>LspLog<cr>", desc = "LSP Log" },
      { "<leader>xs", "<cmd>Lazy sync<cr>", desc = "Lazy Sync" },
    },
  },
}
