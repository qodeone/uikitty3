/**
 * uikitty3 notification systen.
 */
jQuery(function () {
  jQuery('body .uk-notify-alert').on('click', function() {
    UIkit.notification(jQuery(this).data());
  });
  jQuery('body .uk-notify-alert').click();
});
