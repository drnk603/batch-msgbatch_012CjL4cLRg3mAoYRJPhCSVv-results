(function() {
  'use strict';

  window.__app = window.__app || {};

  var debounce = function(func, wait) {
    var timeout;
    return function() {
      var context = this;
      var args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        func.apply(context, args);
      }, wait);
    };
  };

  var throttle = function(func, limit) {
    var inThrottle;
    return function() {
      var context = this;
      var args = arguments;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(function() {
          inThrottle = false;
        }, limit);
      }
    };
  };

  function initAOS() {
    if (window.__app.aosInitialized) return;
    window.__app.aosInitialized = true;

    if (typeof AOS !== 'undefined') {
      var elements = document.querySelectorAll('[data-aos][data-avoid-layout="true"]');
      for (var i = 0; i < elements.length; i++) {
        elements[i].removeAttribute('data-aos');
      }

      AOS.init({
        once: false,
        duration: 600,
        easing: 'ease-out',
        offset: 120,
        mirror: false,
        disable: function() {
          return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        }
      });

      window.__app.refreshAOS = function() {
        try {
          AOS.refresh();
        } catch (e) {}
      };
    } else {
      window.__app.refreshAOS = function() {};
    }
  }

  function initBurgerMenu() {
    if (window.__app.burgerInitialized) return;
    window.__app.burgerInitialized = true;

    var nav = document.querySelector('.c-nav#main-nav');
    var toggle = document.querySelector('.c-nav__toggle');
    var navList = document.querySelector('.c-nav__list');
    var body = document.body;

    if (!nav || !toggle || !navList) return;

    var focusableElements = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    var firstFocusable, lastFocusable;

    function updateFocusableElements() {
      var focusables = navList.querySelectorAll(focusableElements);
      if (focusables.length > 0) {
        firstFocusable = focusables[0];
        lastFocusable = focusables[focusables.length - 1];
      }
    }

    function openMenu() {
      nav.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      body.classList.add('u-no-scroll');
      updateFocusableElements();
      if (firstFocusable) {
        setTimeout(function() {
          firstFocusable.focus();
        }, 100);
      }
    }

    function closeMenu() {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      body.classList.remove('u-no-scroll');
    }

    function trapFocus(e) {
      if (!nav.classList.contains('is-open')) return;
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable.focus();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable.focus();
          }
        }
      }
    }

    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      if (nav.classList.contains('is-open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        closeMenu();
        toggle.focus();
      }
      trapFocus(e);
    });

    document.addEventListener('click', function(e) {
      if (!nav.classList.contains('is-open')) return;
      if (!nav.contains(e.target) && !toggle.contains(e.target)) {
        closeMenu();
      }
    });

    var navLinks = document.querySelectorAll('.c-nav__link');
    for (var i = 0; i < navLinks.length; i++) {
      navLinks[i].addEventListener('click', function() {
        closeMenu();
      });
    }

    var resizeHandler = debounce(function() {
      if (window.innerWidth >= 1024 && nav.classList.contains('is-open')) {
        closeMenu();
      }
    }, 150);

    window.addEventListener('resize', resizeHandler);
  }

  function initAnchors() {
    if (window.__app.anchorsInitialized) return;
    window.__app.anchorsInitialized = true;

    var currentPath = window.location.pathname;
    var isHomepage = currentPath === '/' || currentPath === '/index.html' || currentPath.endsWith('/index.html');

    if (!isHomepage) {
      var links = document.querySelectorAll('a[href^="#"]');
      for (var i = 0; i < links.length; i++) {
        var link = links[i];
        var href = link.getAttribute('href');
        if (href && href.length > 1 && href !== '#' && href !== '#!') {
          link.setAttribute('href', '/' + href);
        }
      }
    }

    document.addEventListener('click', function(e) {
      var target = e.target;
      while (target && target.tagName !== 'A') {
        target = target.parentElement;
      }

      if (!target) return;

      var href = target.getAttribute('href');
      if (!href || href === '#' || href === '#!') return;

      if (href.startsWith('#')) {
        e.preventDefault();
        var targetId = href.substring(1);
        var targetElement = document.getElementById(targetId);
        if (targetElement) {
          var header = document.querySelector('.l-header');
          var headerHeight = header ? header.offsetHeight : 80;
          var targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  }

  function initActiveMenu() {
    if (window.__app.activeMenuInitialized) return;
    window.__app.activeMenuInitialized = true;

    var currentPath = window.location.pathname;
    var navLinks = document.querySelectorAll('.c-nav__link');

    for (var i = 0; i < navLinks.length; i++) {
      var link = navLinks[i];
      var href = link.getAttribute('href');

      link.removeAttribute('aria-current');
      link.classList.remove('active');

      if (href === currentPath || href === currentPath.replace(//$/, '') || 
          (currentPath === '/' && href === '/index.html') ||
          (currentPath === '/index.html' && href === '/')) {
        link.setAttribute('aria-current', 'page');
        link.classList.add('active');
      }
    }
  }

  function initImages() {
    if (window.__app.imagesInitialized) return;
    window.__app.imagesInitialized = true;

    var images = document.querySelectorAll('img');

    for (var i = 0; i < images.length; i++) {
      var img = images[i];

      if (!img.classList.contains('img-fluid')) {
        img.classList.add('img-fluid');
      }

      var hasLoadingAttr = img.hasAttribute('loading');
      var isCritical = img.hasAttribute('data-critical') || img.classList.contains('c-logo__img');

      if (!hasLoadingAttr && !isCritical) {
        img.setAttribute('loading', 'lazy');
      }

      (function(image) {
        image.addEventListener('error', function() {
          var svgPlaceholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23e9ecef"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%236c757d"%3EAfbeelding niet beschikbaar%3C/text%3E%3C/svg%3E';
          image.src = svgPlaceholder;
          image.style.objectFit = 'contain';

          if (image.classList.contains('c-logo__img')) {
            image.style.maxHeight = '40px';
          }
        });
      })(img);
    }
  }

  function initForms() {
    if (window.__app.formsInitialized) return;
    window.__app.formsInitialized = true;

    var forms = document.querySelectorAll('.needs-validation');

    window.__app.notify = function(message, type) {
      var container = document.getElementById('toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:9999;max-width:350px;';
        document.body.appendChild(container);
      }

      var toast = document.createElement('div');
      toast.className = 'alert alert-' + (type || 'info') + ' alert-dismissible fade show';
      toast.setAttribute('role', 'alert');
      toast.innerHTML = message + '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Sluiten"></button>';
      container.appendChild(toast);

      setTimeout(function() {
        toast.classList.remove('show');
        setTimeout(function() {
          if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
          }
        }, 150);
      }, 5000);
    };

    for (var i = 0; i < forms.length; i++) {
      (function(form) {
        form.addEventListener('submit', function(e) {
          e.preventDefault();
          e.stopPropagation();

          if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
          }

          var submitBtn = form.querySelector('button[type="submit"]');
          var originalText = submitBtn ? submitBtn.innerHTML : '';

          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Verzenden...';
          }

          var formData = new FormData(form);
          var data = {};
          formData.forEach(function(value, key) {
            data[key] = value;
          });

          fetch('process.php', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          })
          .then(function(response) {
            return response.json();
          })
          .then(function(result) {
            if (result.success) {
              window.__app.notify('Uw bericht is succesvol verzonden!', 'success');
              form.reset();
              form.classList.remove('was-validated');
            } else {
              window.__app.notify(result.message || 'Er is een fout opgetreden. Probeer het later opnieuw.', 'danger');
            }
          })
          .catch(function() {
            window.__app.notify('Er is een fout opgetreden. Controleer uw internetverbinding.', 'danger');
          })
          .finally(function() {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.innerHTML = originalText;
            }
          });
        });
      })(forms[i]);
    }
  }

  function initAnimeJS() {
    if (window.__app.animeInitialized) return;
    window.__app.animeInitialized = true;

    if (typeof anime === 'undefined') return;

    var selectors = ['.card', '.feature-card', '.animal-card', '.btn-primary', '.btn-success'];
    var elements = [];

    for (var i = 0; i < selectors.length; i++) {
      var found = document.querySelectorAll(selectors[i]);
      for (var j = 0; j < found.length; j++) {
        elements.push(found[j]);
      }
    }

    for (var k = 0; k < elements.length; k++) {
      (function(el) {
        el.addEventListener('mouseenter', function() {
          anime({
            targets: el,
            scale: 1.02,
            opacity: 0.95,
            duration: 300,
            easing: 'easeOutQuad'
          });
        });

        el.addEventListener('mouseleave', function() {
          anime({
            targets: el,
            scale: 1,
            opacity: 1,
            duration: 300,
            easing: 'easeOutQuad'
          });
        });
      })(elements[k]);
    }
  }

  function initMobileFlexGaps() {
    if (window.__app.mobileGapsInitialized) return;
    window.__app.mobileGapsInitialized = true;

    function applyGaps() {
      var isMobile = window.innerWidth < 576;
      var flexContainers = document.querySelectorAll('.d-flex');

      for (var i = 0; i < flexContainers.length; i++) {
        var container = flexContainers[i];
        var hasGap = false;

        var classes = container.className.split(' ');
        for (var j = 0; j < classes.length; j++) {
          if (classes[j].startsWith('gap-') || classes[j].startsWith('g-')) {
            hasGap = true;
            break;
          }
        }

        if (!hasGap && container.children.length > 1) {
          if (isMobile) {
            container.classList.add('gap-3');
            container.setAttribute('data-mobile-gap-added', 'true');
          } else {
            if (container.getAttribute('data-mobile-gap-added') === 'true') {
              container.classList.remove('gap-3');
              container.removeAttribute('data-mobile-gap-added');
            }
          }
        }
      }
    }

    applyGaps();
    window.addEventListener('resize', debounce(applyGaps, 200));
  }

  function initLogoLink() {
    if (window.__app.logoLinkInitialized) return;
    window.__app.logoLinkInitialized = true;

    var logoLink = document.querySelector('.c-logo');
    if (logoLink && logoLink.tagName === 'A') {
      logoLink.setAttribute('href', '/');
    }
  }

  window.__app.init = function() {
    if (window.__app.initialized) return;
    window.__app.initialized = true;

    initAOS();
    initBurgerMenu();
    initAnchors();
    initActiveMenu();
    initImages();
    initForms();
    initAnimeJS();
    initMobileFlexGaps();
    initLogoLink();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.__app.init);
  } else {
    window.__app.init();
  }

})();