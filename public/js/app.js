/* global $*/
'use strict';

$(() => {

  $('#login').on('submit', function (event) {
    event.preventDefault();
    const el = $(event.target);
    const username = el.find('[name=username]').val().trim();
    const password = el.find('[name=password]').val().trim();
    el.trigger('reset');

    return fetch('/api/secret', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ username, password })
    }).then(res => res.json())
      .then(response => {
        el.find('.secret').empty().append(response.message);

      }).catch(err => {
        console.error('ERROR:', err);
      });
  }
  );
});
