function showUtils(button, modal, progressBar, payment) {
    $(button).hide();
    $(modal).hide();
    $(progressBar).show();
    $(payment).css("display", "block");
}

function showPR(result, pr, invoiceRoute, prString) {
    $(pr).attr('src', 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + result.request);
    // create link to open wallet and pay the invoice request automatically
    $(invoiceRoute).prop("href", "lightning:" + result.request);
    // Show invoice request as string
    $(prString).val(result.request);
    $(prString).prop("readonly", true);
}

function copyInvoice(prString, copyBtn) {
    $(copyBtn).on('click', function () {
        /* Get the selected text field */
        $(prString).select();
        /* Copy the text inside the text field */
        document.execCommand("copy");
        // show notification state
        toast('success', 'Invoice Request copied to clipboard');
    });
}

function AnimateProgressbar(timetopay) {
    var start = new Date();
    var maxTime = 3000 * 60;
    var timeoutVal = Math.floor(maxTime / 100);
    animateUpdate();

    function updateProgress(percentage) {
        $(timetopay).val(percentage);
    }

    function animateUpdate() {
        var now = new Date();
        var timeDiff = now.getTime() - start.getTime();
        var perc = Math.round((timeDiff / maxTime) * 100);
        if (perc <= 100) {
            updateProgress(perc);
            setTimeout(animateUpdate, timeoutVal);
        }if (perc == 75){
            toast('warning', "Invoice expiring soon");
        }else if (perc == 100){
            toast('error', "Invoice Expired");
        }
    }
}