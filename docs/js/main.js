var slideIndex = 1;
$(document).ready(function () {
    $('#a_product').click(function () {
        var moveTop = $('#a_productLabel').offset().top;
        if (window.matchMedia('(max-width: 767px)').matches) {
            moveTop -= 150;
        } else {
            moveTop -= 55;
        }
        $('html,body').animate({
            scrollTop: moveTop
        }, 400);
        return false;
    });
    $('#a_advantech').click(function () {
        var moveTop = $('#a_advantechLabel').offset().top;
        if (window.matchMedia('(max-width: 767px)').matches) {
            moveTop -= 150;
        } else {
            moveTop -= 55;
        }
        $('html,body').animate({
            scrollTop: moveTop
        }, 400);
        return false;
    });
    $('#a_application').click(function () {
        var moveTop = $('#a_applicationLabel').offset().top;
        if (window.matchMedia('(max-width: 767px)').matches) {
            moveTop -= 150;
        } else {
            moveTop -= 55;
        }
        $('html,body').animate({
            scrollTop: moveTop
        }, 400);
        return false;
    });

    window.slideIndex = 1;
    showSlides(slideIndex);


    function plusSlides(n) {
        clearTimeout(window.slideTimeout);
        showSlides(slideIndex += n);
        window.slideTimeout = setTimeout(function () {
            slideRePlay();
        }, 10000)
    }
    window.plusSlides = plusSlides;

    function currentSlide(n) {
        clearTimeout(window.slideTimeout);
        showSlides(slideIndex = n);
        window.slideTimeout = setTimeout(function () {
            slideRePlay();
        }, 10000)
    }
    window.currentSlide = currentSlide;

    function showSlides(n) {
        var i;
        var slides = document.getElementsByClassName("kl-Slides");
        var dots = document.getElementsByClassName("kl-Slides-dot");
        if (n > slides.length) {
            slideIndex = 1
        }
        if (n < 1) {
            slideIndex = slides.length
        }
        for (i = 0; i < slides.length; i++) {
            // slides[i].style.display = "none";  
            slides[i].className = slides[i].className.replace(" kl-Slides-active", "");
        }
        for (i = 0; i < dots.length; i++) {
            dots[i].className = dots[i].className.replace(" kl-Slides-dot-active", "");
        }
        // slides[slideIndex-1].style.display = "block";  
        slides[slideIndex - 1].className += " kl-Slides-active";
        dots[slideIndex - 1].className += " kl-Slides-dot-active";
    }
    window.showSlides = showSlides;

    function countLines(ele) {
        var styles = window.getComputedStyle(ele, null);
        var lh = parseInt(styles.lineHeight, 10);
        var h = parseInt(styles.height, 10);
        var lc = Math.round(h / lh);
        // console.log('line count:', lc, 'line-height:', lh, 'height:', h);
        return lc;
    }

    function removeBr(str) {
        if (str.endsWith("<br>")) {
            str = str.substring(0, str.length - 4);
            return removeBr(str)
        } else {
            return str;
        }
    }

    function scrollPosition() {
        var scroll = $(window).scrollTop();
        if (window.matchMedia('(max-width: 767px)').matches) {
            // $('#NavNenu').removeClass('NavNenuFixed');
            // if (scroll > 56) {
            //     $('#NavNenu .navbar').first().addClass('NavNenuFixed');
            //     $('body').css({'padding-top':'56px'});
            // } else {
            //     $('#NavNenu .navbar').first().removeClass('NavNenuFixed');
            //     $('body').css({'padding-top':'0px'});
            // }
            $('.kl-menu').first().removeClass('kl-move-menu-fixed');
            var upperBound = $('.kl-banner').first().offset().top + $('.kl-banner').first().height() + $('.kl-menu').first().height();
            if (scroll > upperBound) {
                $('.kl-menu').first().addClass('kl-move-menu-fixed');
                $('.kl-menu-moveBlock').show();
            } else {
                $('.kl-menu').first().removeClass('kl-move-menu-fixed');
                $('.kl-menu-moveBlock').hide();
            }
        } else {
            $('.kl-menu').first().removeClass('kl-move-menu-fixed');
            var upperBound = $('.kl-banner').first().offset().top + $('.kl-banner').first().height() + $('.kl-menu').first().height();
            if (scroll > upperBound) {
                $('.kl-menu').first().addClass('kl-move-menu-fixed');
                $('.kl-menu-moveBlock').show();
            } else {
                $('.kl-menu').first().removeClass('kl-move-menu-fixed');
                $('.kl-menu-moveBlock').hide();
            }
        }
        var window_height = window.screen.availHeight * 0.6;
        $('.kl-product-container .kl-item-card2').each(function (index) {
            var parentTop = $(this).parents('.kl-product-container').first().offset().top;
            if ($(this).hasClass('kl-fly-up')) {
                // return false;
            } else {
                if ((scroll + window_height) > parentTop) {
                    $(this).addClass('kl-fly-up')
                } else {}
            }
        })
        // var learnMoreTop = $('.kl-learnMore').first().offset().top;
        // if (!$('.kl-learnMoreMagnifier').first().hasClass('kl-fly-up')) {
        //     if ((scroll + window_height) > learnMoreTop) {
        //         $('.kl-learnMoreMagnifier').first().addClass('kl-fly-up')
        //     }
        // }

        var itemCard1TitleLineCount = 0;
        $('.kl-item-card1-title').each(function () {
            $(this).html(removeBr($(this).html()))
            itemCard1TitleLineCount = Math.max(countLines($(this).get(0)), itemCard1TitleLineCount)
        })
        $('.kl-item-card1-title').each(function () {
            var thisLineCount = countLines($(this).get(0));
            // console.log(thisLineCount, itemCard1TitleLineCount,thisLineCount < itemCard1TitleLineCount, $(this).html())
            if (thisLineCount < itemCard1TitleLineCount) {
                var res = $(this).html() + '<br>';
                for (var i = 0; i < (itemCard1TitleLineCount - thisLineCount); i++) {
                    res += '<br>';
                }
                $(this).html(res)
            }
        })
        var klItemCard1DespLineCount = 0;
        $('.kl-item-card1-desp').each(function () {
            $(this).html(removeBr($(this).html()))
            klItemCard1DespLineCount = Math.max(countLines($(this).get(0)), klItemCard1DespLineCount)
        })
        $('.kl-item-card1-desp').each(function () {
            var thisLineCount = countLines($(this).get(0));
            if (thisLineCount < klItemCard1DespLineCount) {
                var res = $(this).html() + '<br>';
                for (var i = 0; i < (klItemCard1DespLineCount - thisLineCount); i++) {
                    res += '<br>';
                }
                $(this).html(res)
            }
        })
        var klItemCard3TitleLineCount = 0;
        $('.kl-item-card3-title').each(function () {
            $(this).html(removeBr($(this).html()))
            klItemCard3TitleLineCount = Math.max(countLines($(this).get(0)), klItemCard3TitleLineCount)
        })
        $('.kl-item-card3-title').each(function () {
            var thisLineCount = countLines($(this).get(0));
            if (thisLineCount < klItemCard3TitleLineCount) {
                var res = $(this).html() + '<br>';
                for (var i = 0; i < (klItemCard3TitleLineCount - thisLineCount); i++) {
                    res += '<br>';
                }
                $(this).html(res)
            }
        })


    }

    function resizeListHeight() {
        window.newklItemLiHeight = 0;
        window.klItemLiHeight = 0;
        $('.kl-product-container').find('.kl-item-li-4').height('auto');
        $('.kl-product-container').find('.kl-item-li-4').each(function () {
            var styles = window.getComputedStyle($(this).get(0), null);
            var h = parseInt(styles.height, 10);
            newklItemLiHeight = Math.max(h, klItemLiHeight);
        })
        if (newklItemLiHeight != klItemLiHeight) {
            klItemLiHeight = newklItemLiHeight;
            $('.kl-product-container').find('.kl-item-li-4').height(klItemLiHeight)
            $('.kl-product-container').find('.kl-item-li-4').find('.kl-item-card2').height(klItemLiHeight - 20)
        }
    }
    resizeListHeight()

    scrollPosition();

    function slideRePlay() {
        plusSlides(1);
        window.slideTimeout = setTimeout(function () {
            slideRePlay();
        }, 10000)
    }
    slideRePlay();
    $(window).scroll(function () {
        scrollPosition();
        // if ($(this).scrollTop() > 100) {
        //     $('#backToTop').fadeIn(200);
        // } else {
        //     $('#backToTop').fadeOut(200);
        // }
    });
    $(window).on('resize', function () {
        scrollPosition();

    })
});