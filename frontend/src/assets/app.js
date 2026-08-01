// Shared boot: icons + tiny helpers
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();
});

function foliQS(sel, root = document){ return root.querySelector(sel); }
function foliQSA(sel, root = document){ return Array.from(root.querySelectorAll(sel)); }
