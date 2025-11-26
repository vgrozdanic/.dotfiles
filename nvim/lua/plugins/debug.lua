return {
  {
    "folke/trouble.nvim",
    cmd = { "TroubleToggle", "Trouble" },
    opts = { use_diagnostic_signs = true },
    keys = {
      { "<leader>xx", "<cmd>TroubleToggle document_diagnostics<cr>", desc = "Document Diagnostics (Trouble)" },
      { "<leader>xX", "<cmd>TroubleToggle workspace_diagnostics<cr>", desc = "Workspace Diagnostics (Trouble)" },
      { "<leader>xL", "<cmd>TroubleToggle loclist<cr>", desc = "Location List (Trouble)" },
      { "<leader>xQ", "<cmd>TroubleToggle quickfix<cr>", desc = "Quickfix List (Trouble)" },
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