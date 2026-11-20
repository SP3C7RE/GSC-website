(function () {
  'use strict';
  var dateEl = document.getElementById('boardDate');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  var filters = document.getElementById('boardFilters');
  var grid = document.getElementById('intelGrid');
  if (!filters || !grid) return;

  var chips = filters.querySelectorAll('.filter-chip');
  var cards = grid.querySelectorAll('.intel-card');

  filters.addEventListener('click', function (e) {
    var chip = e.target.closest('.filter-chip');
    if (!chip) return;

    chips.forEach(function (c) { c.classList.remove('is-active'); });
    chip.classList.add('is-active');

    var filter = chip.getAttribute('data-filter');
    cards.forEach(function (card) {
      var match = filter === 'all' || card.getAttribute('data-category') === filter;
      card.style.display = match ? '' : 'none';
    });
  });
})();
