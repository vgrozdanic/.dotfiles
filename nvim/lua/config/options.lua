local opt = vim.opt

-- Disable netrw (use nvim-tree instead)
vim.g.loaded_netrw = 1
vim.g.loaded_netrwPlugin = 1

-- General
opt.mouse = "a"
opt.clipboard = "unnamedplus"
opt.swapfile = false
opt.backup = false
opt.undofile = true
opt.timeoutlen = 300
opt.updatetime = 200

-- UI
opt.number = true
opt.relativenumber = true
opt.signcolumn = "yes"
opt.cursorline = true
opt.termguicolors = true
opt.laststatus = 3
opt.showmode = false
opt.ruler = false
opt.title = true
opt.conceallevel = 0
opt.colorcolumn = "100"
opt.cmdheight = 1
opt.shortmess:append("c")

-- Editing
opt.expandtab = true
opt.shiftwidth = 2
opt.tabstop = 2
opt.softtabstop = 2
opt.smartindent = true
opt.smartcase = true
opt.ignorecase = true
opt.wrap = false
opt.breakindent = true
opt.scrolloff = 8
opt.sidescrolloff = 8
opt.virtualedit = "block"

-- Search
opt.hlsearch = true
opt.incsearch = true
opt.inccommand = "nosplit"

-- Splits
opt.splitbelow = true
opt.splitright = true

-- Completion
opt.completeopt = "menu,menuone,noselect"
opt.pumheight = 10
opt.pumblend = 10

-- Spell checking
opt.spell = true
opt.spelllang = { "en_us" }
opt.spelloptions = "camel"

-- Folding
opt.foldcolumn = "1"
opt.foldlevel = 99
opt.foldlevelstart = 99
opt.foldenable = true
opt.fillchars = {
  foldopen = "▾",
  foldclose = "▸",
  fold = " ",
  foldsep = " ",
  diff = "╱",
  eob = " ",
}