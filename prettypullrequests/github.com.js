var isGitHub = $("meta[property='og:site_name']").attr('content') === 'GitHub';
var useLocalStorage = true;
var lsNamespace = 'ppr'; // Prepend to entries in localStorage for some namespacing to make deletion easier.
var pullRequestNumber;
var commitHash;
var repositoryName;
var repositoryAuthor;
var autoCollapseExpressions;
var initialAutoCollapseExpressions = '^(?!.*(cs|xml)$).*$';

function needInitialize() {
  var filesChangedTab = document.querySelector('nav.tabnav-tabs > a.tabnav-tab:last-child');
  if (filesChangedTab) {
    // "Files changed" tab didn't have "selected" class.
    if (!filesChangedTab.classList.contains('selected'))
      return false;

    return $('.file-info').length !== $('.file-info.pretty').length;
  }
  // Not found "Files changed" tab.
  return false;
}

function injectHtml() {
  $('.file-info:not(.pretty) .link-gray-dark').on('click', clickTitle);
  $('.file-info').addClass("pretty");
}

function collapseAdditions() {
    if (isGitHub) {
        $(this).closest('[id^=diff-]').find('.blob-code-addition').parent('tr').slideToggle();
    } else {
        $(this).closest('[id^=diff-]').find('.gi').slideToggle();
    }
}

function collapseDeletions() {
    if (isGitHub) {
        $(this).closest('[id^=diff-]').find('.blob-code-deletion').parent('tr').slideToggle();
    } else {
        $(this).closest('[id^=diff-]').find('.gd').slideToggle();
    }
}

function getDiffSpans(path) {
    return $('.file-info .link-gray-dark').filter(function () {
        return this.innerHTML.trim().match(path);
    });
}

function getIds(path) {
    var $spans = getDiffSpans(path).closest('[id^=diff-]');
    var $as = $spans.prev('a[name^=diff-]');
    var $ids = $as.map(function(index, a) {
        return $(a).attr('name');
    });

    return $ids;
}

function getId(path) {
    var $span = $('a[title="' + path + '"]').closest('[id^=diff-]');
    var $a = $span.prev('a[name^=diff-]');
    var id = $a.attr('name');

    return id;
}

function uniquify(diffId) {
  var diffViewId = pullRequestNumber || commitHash;

  return lsNamespace + '|' + repositoryAuthor + '|' + repositoryName + '|' + diffViewId + '|' + diffId;
}

function collectUniquePageInfo() {
  repositoryAuthor = $('[itemprop="author"]').find('a').text();
  repositoryName = $('strong[itemprop="name"]').find('a').text();
  pullRequestNumber = $('.gh-header-number').text();
  commitHash = $('.sha.user-select-contain').text();
}

function toggleDiff(id, duration, display) {
    var $a = $('a[name^=' + id + ']');
    duration = !isNaN(duration) ? duration : 200;

    if ($.inArray(display, ['expand', 'collapse', 'toggle']) < 0) {
        if (!useLocalStorage) {
            display = 'toggle';
        } else {
            display = (localStorage.getItem(uniquify(id)) === 'collapse') ? 'expand' : 'collapse';
        }
    }

    if ($a) {
        var $span = $a.next('div[id^=diff-]');
        switch (display) {
            case 'toggle':
                $span.toggleClass('open Details--on');
                return true;
            case 'expand':
                $span.removeClass('open Details--on');
                return useLocalStorage ? localStorage.removeItem(uniquify(id)) : true;
            default:
                $span.addClass('open Details--on');
                return useLocalStorage ? localStorage.setItem(uniquify(id), display) : true;
        }
    }
    return false;
}

function toggleDiffs(path, display) {
    var $ids = getIds(path);

    $ids.each(function(index, id) {
        toggleDiff(id, 200, display);
    });
}

function moveToNextTab($pullRequestTabs, selectedTabIndex) {
    selectedTabIndex += 1;
    if (selectedTabIndex >= $pullRequestTabs.length) {
        selectedTabIndex = 0;
    }
    $pullRequestTabs[selectedTabIndex].click();
}

function moveToPreviousTab($pullRequestTabs, selectedTabIndex) {
    selectedTabIndex -= 1;
    if (selectedTabIndex < 0) {
        selectedTabIndex = $pullRequestTabs.length - 1;
    }
    $pullRequestTabs[selectedTabIndex].click();
}

function initDiffs() {
    if (useLocalStorage) {
        $('a[name^=diff-]').each(function(index, item) {
            var id = $(item).attr('name');

            if (localStorage.getItem(uniquify(id)) === 'collapse') {
                toggleDiff(id, 0, 'collapse');
            }
        });
    }
    autoCollapse();
}

function clickTitle() {
    var path = $(this).attr('title');
    var id = getId(path);

    return toggleDiff(id);
}

function clickCollapse() {
    var $span = $(this).closest('.js-file-content').prev('.file-header');
    var path = $span.attr('data-path');
    var id = getId(path);

    return toggleDiff(id, '200', 'collapse');
}

function autoCollapse() {
    autoCollapseExpressions.forEach(item => {
        toggleDiffs(item, 'collapse');
    });
}

chrome.storage.sync.get({url: '', saveCollapsedDiffs: false, tabSwitchingEnabled: false, autoCollapseExpressions: [initialAutoCollapseExpressions]}, function(items) {
    if (items.url == window.location.origin ||
        "https://github.com" === window.location.origin) {

        autoCollapseExpressions = items.autoCollapseExpressions;

        var injectHtmlIfNecessary = function () {
            if (needInitialize()) {
                collectUniquePageInfo();
                injectHtml();
                initDiffs();
            }
            setTimeout(injectHtmlIfNecessary, 1000);
        };

        chrome.storage.onChanged.addListener(changes => {
          for(let key in changes) {
            items[key] = changes[key].newValue;
          }
          autoCollapseExpressions = items.autoCollapseExpressions;
          useLocalStorage = items.saveCollapsedDiffs;
        });

        var $body = $('body');
        useLocalStorage = items.saveCollapsedDiffs;

        injectHtmlIfNecessary();

        if (items.tabSwitchingEnabled) {
          $body.on('keydown', function (e) {
              if (e.keyCode !== 192 || e.target.nodeName === 'TEXTAREA') {
                  return;
              }

              var $pullRequestTabs = $('nav.tabnav-tabs a.tabnav-tab');
              var $selectedTab     = $('nav.tabnav-tabs a.tabnav-tab.selected');
              var selectedTabIndex = $pullRequestTabs.index( $selectedTab );

              if (e.shiftKey) {
                  // Making this work like it would in other apps, where the shift
                  // key makes the cmd+tilde go backwards through the list.
                  moveToPreviousTab($pullRequestTabs, selectedTabIndex);
              } else {
                  moveToNextTab($pullRequestTabs, selectedTabIndex);
              }
          });
        }

        // Actions per changed file
        chrome.runtime.onConnect.addListener(function (port) {
            console.assert(port.name == "pullrequest");

            port.onMessage.addListener(function (msg) {
                if (msg.collapse !== undefined) {
                    toggleDiffs(msg.collapse, 'collapse');
                }
                if (msg.expand !== undefined) {
                    toggleDiffs(msg.expand, 'expand');
                }
                if (msg.goto !== undefined) {
                    getDiffSpans(msg.goto)[0].scrollIntoViewIfNeeded();
                }
            });
        });

        // Create the tree with the changed files after pressing the octocat button
        chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
            if (request.getPaths) {
                var paths = $.map($('.file-info .link-gray-dark'), function (item) {
                    return $.trim(item.innerHTML);
                });
                if (paths.length > 0) {
                    sendResponse({paths: paths});
                }
            }
        });
    }
});
window.addEventListener('load', extendUI);
document.addEventListener('pjax:end', extendUI);

function createButton(text) {
  let button = document.createElement('button');
  button.classList.add("btn");
  button.classList.add("btn-sm");
  if (text) button.innerText = text;
  return button;
}

function extendUI() {
  let prReviewTools = document.querySelector('div.float-right.pr-review-tools');
  if (!prReviewTools) return;

  let hideCollapsed = document.getElementById('ppr-hideColapsed');
  let allControlTools = document.getElementById('ppr-allControlTools')

  // Toggle hide collapsed files.
  if (!hideCollapsed) {
    hideCollapsed = document.createElement('div');
    hideCollapsed.id = 'ppr-hideColapsed';
    prReviewTools.insertBefore(hideCollapsed, prReviewTools.firstElementChild);
  } else {
    while(hideCollapsed.firstElementChild)
      hideCollapsed.removeChild(hideCollapsed.firstElementChild);
  }
  hideCollapsed.classList.add('diffbar-item');
  var toggleButton = document.createElement('button');
  toggleButton.classList.add('ppr-toggle');
  toggleButton.classList.add('tooltipped');
  toggleButton.classList.add('tooltipped-s');
  toggleButton.innerText = 'Hide collapsed';
  toggleButton.setAttribute('aria-label', 'Hide collapsed files');
  toggleButton.addEventListener('click', function() {
    let targets = document.querySelectorAll('div.file.js-file.js-details-container');
    if (this.classList.contains('selected')) {
      this.classList.remove('selected');
      targets.forEach(e => {
        e.classList.remove('ppr-hidden');
      });
      this.setAttribute('aria-label', 'Hide collapsed files');
    } else {
      this.classList.add('selected');
      let hiddenFilesNum = 0;
      targets.forEach(e => {
        e.classList.add('ppr-hidden');
        if (e.classList.contains('open') && e.classList.contains('Details--on')) hiddenFilesNum++;
      });
      this.setAttribute('aria-label', hiddenFilesNum + ' hidden files');
    }
  });
  toggleButton.addEventListener('mouseout', toggleButton.blur);
  hideCollapsed.appendChild(toggleButton);

  // Expand or Collapse all files.
  if (!allControlTools) {
    allControlTools = document.createElement('div');
    allControlTools.id = 'ppr-allControlTools';
    prReviewTools.insertBefore(allControlTools, prReviewTools.firstElementChild);
  } else {
    while(allControlTools.firstElementChild)
      allControlTools.removeChild(allControlTools.firstElementChild);
  }
  allControlTools.classList.add('diffbar-item');

  var expandAllButton = createButton('＋');
  expandAllButton.style.marginRight = '10px';
  expandAllButton.classList.add('tooltipped');
  expandAllButton.classList.add('tooltipped-s');
  expandAllButton.setAttribute('aria-label', 'Expand all files');
  expandAllButton.addEventListener('click', () => {
    document.querySelectorAll('div.file.js-file.js-details-container').forEach(e => {
      e.classList.remove('open');
      e.classList.remove('Details--on');
    });
    if (toggleButton.classList.contains('selected'))
      toggleButton.setAttribute('aria-label', '0 hidden files');
  });
  expandAllButton.addEventListener('mouseout', expandAllButton.blur);
  allControlTools.appendChild(expandAllButton);
  var collapseAllButton = createButton('－');
  collapseAllButton.classList.add('tooltipped');
  collapseAllButton.classList.add('tooltipped-s');
  collapseAllButton.setAttribute('aria-label', 'Collapse all files');
  collapseAllButton.addEventListener('click', () => {
    let hiddenFilesNum = 0;
    document.querySelectorAll('div.file.js-file.js-details-container').forEach(e => {
      e.classList.add('open');
      e.classList.add('Details--on');
      hiddenFilesNum++;
    });
    if (toggleButton.classList.contains('selected'))
      toggleButton.setAttribute('aria-label', hiddenFilesNum + ' hidden files');
  });
  collapseAllButton.addEventListener('mouseout', collapseAllButton.blur);
  allControlTools.appendChild(collapseAllButton);
}
