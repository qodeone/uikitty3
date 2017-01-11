/**
 * uikitty notification systen.
 */
jQuery(function () {
  jQuery("body").on("click", ".uk-button[data-message]", function () {
    UIkit.notification({
      message: jQuery(this).data(),
      status: 'primary',
      pos: 'top-right',
      timeout: 5000
    });
  });
  jQuery('body .uk-notify-alert').click();
})