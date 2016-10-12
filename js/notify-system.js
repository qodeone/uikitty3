        jQuery(function(){
            jQuery("body").on("click", ".uk-button[data-message]", function(){
                UIkit.notify(jQuery(this).data());
            });
            jQuery('body .uk-notify-alert').click();
        })