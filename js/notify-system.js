/**
 * uikitty notification systen.
 */

jQuery(function () {
  jQuery("body").on("click", ".uk-button[data-message]", function () {
    UIkit.notification(jQuery(this).data());
  });
  jQuery('body .uk-notify-alert').click();
})