(function () {
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  function uniqueValues(cards, name) {
    var values = [];
    cards.forEach(function (card) {
      var value = card.getAttribute(name);
      if (value && values.indexOf(value) === -1) {
        values.push(value);
      }
    });
    return values.sort(function (a, b) {
      return String(b).localeCompare(String(a), 'zh-CN');
    });
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function applyFilters(scope, input, yearSelect, typeSelect, emptyState) {
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
    var keyword = input ? input.value.trim().toLowerCase() : '';
    var year = yearSelect ? yearSelect.value : '';
    var type = typeSelect ? typeSelect.value : '';
    var visible = 0;

    cards.forEach(function (card) {
      var text = card.getAttribute('data-search') || '';
      var cardYear = card.getAttribute('data-year') || '';
      var cardType = card.getAttribute('data-type') || '';
      var matched = true;

      if (keyword && text.indexOf(keyword) === -1) {
        matched = false;
      }
      if (year && cardYear !== year) {
        matched = false;
      }
      if (type && cardType !== type) {
        matched = false;
      }

      card.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.hidden = visible !== 0;
    }
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var section = scope.closest('section') || document;
    var input = section.querySelector('[data-filter-input]');
    var yearSelect = section.querySelector('[data-filter-year]');
    var typeSelect = section.querySelector('[data-filter-type]');
    var emptyState = section.querySelector('[data-empty-state]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));

    fillSelect(yearSelect, uniqueValues(cards, 'data-year'));
    fillSelect(typeSelect, uniqueValues(cards, 'data-type'));

    if (input && input.hasAttribute('data-search-page-input')) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q) {
        input.value = q;
      }
    }

    [input, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', function () {
          applyFilters(scope, input, yearSelect, typeSelect, emptyState);
        });
        control.addEventListener('change', function () {
          applyFilters(scope, input, yearSelect, typeSelect, emptyState);
        });
      }
    });

    applyFilters(scope, input, yearSelect, typeSelect, emptyState);
  });
})();
