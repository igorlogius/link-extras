/* global browser */

const manifest = browser.runtime.getManifest();
const extname = manifest.name;

async function notify(
  title,
  message = "",
  aux = { iconUrl: "icon.png", msToClose: 3500 },
) {
  const nid = await browser.notifications.create("" + Date.now(), {
    type: "basic",
    iconUrl: aux.iconUrl,
    title,
    message,
  });

  if (aux.msToClose > 0) {
    setTimeout(() => {
      browser.notifications.clear("" + nid);
    }, aux.msToClose);
  }
}

function getTimeStampStr() {
  const d = new Date();
  let ts = "";
  [
    d.getFullYear(),
    d.getMonth() + 1,
    d.getDate() + 1,
    d.getHours(),
    d.getMinutes(),
    d.getSeconds(),
  ].forEach((t, i) => {
    ts = ts + (i !== 3 ? "-" : "_") + (t < 10 ? "0" : "") + t;
  });
  return ts.substring(1);
}

async function getFromStorage(type, id, fallback) {
  let tmp = await browser.storage.local.get(id);
  return typeof tmp[id] === type ? tmp[id] : fallback;
}
const nl = "\n";
const br = "<br/>";

let selectors = [];
let seperator = nl;

async function onStorageChange() {
  selectors = await getFromStorage("object", "selectors", selectors);
  separator = await getFromStorage("string", "separator", seperator);
}

async function onMenuShow(/*info, tab*/) {
  browser.menus.removeAll();

  browser.menus.create({
    id: "tabs_actions",
    title: "Browser Actions",
  });

  browser.menus.create({
    id: "copy_actions",
    title: "Copy Actions",
  });

  browser.menus.create({
    title: "Bookmark Links",
    contexts: ["link", "selection"],
    parentId: "tabs_actions",
    onclick: async (info) => {
      //-- handle text selection

      let links = [];

      if (info.selectionText) {
        const ret = await browser.tabs.executeScript({
          code: `selection = getSelection();
                 [...document.links]
                        .filter((anchor) => selection.containsNode(anchor, true))
                        .map(link => link.href);`,
        });

        links = ret[0];
      } else {
        //-- handle link selection
        links.push(info.linkUrl);
      }

      // erzeuge einen Folder in Other Bookmarks

      bmtn = await browser.bookmarks.create({
        title: "Link Group " + getTimeStampStr(),
      });

      for (const link of links) {
        browser.bookmarks.create({
          title: link,
          parentId: bmtn.id,
          url: link,
        });
      }

      notify(extname, "Created " + links.length + " Bookmarks");
    },
  });

  browser.menus.create({
    title: "Open Links in Tabs",
    contexts: ["link", "selection"],
    parentId: "tabs_actions",
    onclick: async (info) => {
      //-- handle text selection

      let links = [];

      if (info.selectionText) {
        const ret = await browser.tabs.executeScript({
          code: `selection = getSelection();
                 [...document.links]
                        .filter((anchor) => selection.containsNode(anchor, true))
                        .map(link => link.href);`,
        });

        links = ret[0];
      } else {
        //-- handle link selection
        links.push(info.linkUrl);
      }

      for (const link of links) {
        browser.tabs.create({
          url: link,
          active: false,
        });
      }

      notify(extname, "Created " + links.length + " Tabs");
    },
  });

  browser.menus.create({
    title: "Open Links in unloaded Tabs",
    contexts: ["link", "selection"],
    parentId: "tabs_actions",
    onclick: async (info) => {
      //-- handle text selection

      let links = [];

      if (info.selectionText) {
        const ret = await browser.tabs.executeScript({
          code: `selection = getSelection();
                 [...document.links]
                        .filter((anchor) => selection.containsNode(anchor, true))
                        .map(link => link.href);`,
        });

        links = ret[0];
      } else {
        //-- handle link selection
        links.push(info.linkUrl);
      }

      for (const link of links) {
        browser.tabs.create({
          url: link,
          active: false,
          discarded: true,
        });
      }
      notify(extname, "Created " + links.length + "unloaded Tabs");
    },
  });

  browser.menus.create({
    title: "Open Links in new Window",
    contexts: ["link", "selection"],
    parentId: "tabs_actions",
    onclick: async (info) => {
      //-- handle text selection

      let links = [];

      if (info.selectionText) {
        const ret = await browser.tabs.executeScript({
          code: `selection = getSelection();
                 [...document.links]
                        .filter((anchor) => selection.containsNode(anchor, true))
                        .map(link => link.href);`,
        });

        links = ret[0];
      } else {
        //-- handle link selection
        links.push(info.linkUrl);
      }

      browser.windows.create({
        url: links,
      });

      notify(extname, "Created new Window with " + links.length + " Tabs");
    },
  });

  browser.menus.create({
    title: "Select related Tabs",
    contexts: ["link", "selection"],
    parentId: "tabs_actions",
    onclick: async (info) => {
      //-- handle text selection

      let links = [];

      if (info.selectionText) {
        const ret = await browser.tabs.executeScript({
          code: `selection = getSelection();
                 [...document.links]
                        .filter((anchor) => selection.containsNode(anchor, true))
                        .map(link => link.href);`,
        });

        links = ret[0];
      } else {
        //-- handle link selection
        links.push(info.linkUrl);
      }

      const tabIdxs = (await browser.tabs.query({}))
        .filter((t) => links.includes(t.url))
        .map((t) => t.index);

      browser.tabs.highlight({ tabs: tabIdxs });

      notify(extname, "Selected " + tabIdxs.length + " related Tabs");
    },
  });

  browser.menus.create({
    title: "Close related Tabs",
    contexts: ["link", "selection"],
    parentId: "tabs_actions",
    onclick: async (info) => {
      //-- handle text selection

      let links = [];

      if (info.selectionText) {
        const ret = await browser.tabs.executeScript({
          code: `selection = getSelection();
                 [...document.links]
                        .filter((anchor) => selection.containsNode(anchor, true))
                        .map(link => link.href);`,
        });

        links = ret[0];
      } else {
        //-- handle link selection
        links.push(info.linkUrl);
      }

      const tabIdsToClose = (await browser.tabs.query({}))
        .filter((t) => links.includes(t.url))
        .map((t) => t.id);

      browser.tabs.remove(tabIdsToClose);

      notify(extname, "Closed " + tabIdsToClose.length + " related Tabs");
    },
  });

  browser.menus.create({
    title: "Download Links",
    contexts: ["link", "selection"],
    onclick: async (info) => {
      //-- handle text selection

      let links = [];

      if (info.selectionText) {
        const ret = await browser.tabs.executeScript({
          code: `selection = getSelection();
                 [...document.links]
                        .filter((anchor) => selection.containsNode(anchor, true))
                        .map(link => link.href);`,
        });

        links = ret[0];
      } else {
        //-- handle link selection
        links.push(info.linkUrl);
      }

      for (const link of links) {
        browser.downloads.download({
          url: link,
          saveAs: false,
        });
      }

      notify(extname, "Downloaded " + links.length + " Links");
    },
  });

  browser.menus.create({
    contexts: ["link", "selection"],
    type: "separator",
  });

  for (const row of selectors) {
    browser.menus.create({
      title: row.name,
      contexts: ["link", "selection"],
      parentId: "copy_actions",
      onclick: async (info) => {
        //-- handle text selection

        let links = [];

        if (info.selectionText) {
          const ret = await browser.tabs.executeScript({
            code: `selection = getSelection();
                    [...document.links]
                    .filter((anchor) => selection.containsNode(anchor, true))
                    .map((link) => ({
                        text: link.innerText,
                        url: link.href,
                    }));`,
          });
          links = ret[0];
        } else {
          //-- handle link selection
          links.push({ text: info.linkText, url: info.linkUrl });
        }

        let tmp3 = "";
        let tmp4 = "";

        for (const link of links) {
          const fmtStr = row.format;
          let tmp2 = fmtStr;

          const replacers = new Map();

          const url = new URL(link.url);

          replacers.set("url_proto", url.protocol);
          replacers.set("url_host", url.hostname);
          replacers.set("url_port", url.port);
          replacers.set("url_path", url.pathname);
          replacers.set("url_params", url.search);
          replacers.set("url_origin", url.origin);
          replacers.set("url", url.href);
          replacers.set("text", link.text);

          for (const [k, v] of replacers) {
            tmp2 = tmp2.replaceAll("%" + k, v);
          }

          tmp3 = tmp3 + tmp2 + (separator === "" ? nl : separator);
        }

        tmp3 = tmp3.replaceAll("%nl", nl);

        if (row.html === true) {
          tmp4 += tmp3.replaceAll(nl, br) + "</span>";
          navigator.clipboard.write([
            new ClipboardItem({
              "text/plain": new Blob([tmp3], {
                type: "text/plain",
              }),
              "text/html": new Blob([tmp4], {
                type: "text/html",
              }),
            }),
          ]);
        } else {
          navigator.clipboard.writeText(tmp3);
        }

        notify(extname, "Copied " + links.length + " Links (" + row.name + ")");
      },
    });
  }

  browser.menus.create({
    contexts: ["link", "selection"],
    parentId: "copy_actions",
    type: "separator",
  });

  browser.menus.create({
    title: "Configure",
    contexts: ["link", "selection"],
    parentId: "copy_actions",
    onclick: async (info) => {
      browser.runtime.openOptionsPage();
    },
  });

  browser.menus.refresh();
}

async function setToStorage(id, value) {
  let obj = {};
  obj[id] = value;
  return browser.storage.local.set(obj);
}

async function handleInstalled(details) {
  if (details.reason === "install") {
    selectors = [
      { html: false, name: "Text", format: "%text" },
      { html: false, name: "URL", format: "%url" },
      { html: false, name: "URL - Params", format: "%url_origin%url_params" },
      { html: false, name: "Text + URL", format: "%text + %url" },
      {
        html: false,
        name: "Text + URL - Params",
        format: "%text + %url_origin%url_params",
      },
      { html: false, name: "Markdown", format: "[%text](%url)" },
      { html: true, name: "HTML", format: '<a href="%url">%text</a>' },
    ];
    await setToStorage("selectors", selectors);
    browser.runtime.openOptionsPage();
  }
}

async function onCommand(cmd) {
  //-- handle text selection

  const ret = await browser.tabs.executeScript({
    code: `(() => {
        const docLinks = [...document.links];
        let links = [];
            links  = docLinks
            .filter((anchor) => anchor.matches(':hover'));
        if(links.length === 0){
            links  = docLinks
            .filter((anchor) => getSelection().containsNode(anchor, true));
        }
        links = links.map((link) => ({
            text: link.innerText,
            url: link.href,
        }));
        return links;
    })();
          `,
  });

  let links = ret[0];

  if (cmd === "download") {
    for (const link of links) {
      browser.downloads.download({
        url: link.url,
        saveAs: false,
      });
    }

    notify(extname, "Downloaded " + links.length + " Links");

    return;
  }

  if (cmd === "open") {
    for (const link of links) {
      browser.tabs.create({
        url: link.url,
        active: false,
      });
    }

    notify(extname, "Opened " + links.length + " Tabs");
    return;
  }

  if (cmd === "open_unloaded") {
    for (const link of links) {
      browser.tabs.create({
        url: link.url,
        discarded: true,
        active: false,
      });
    }

    notify(extname, "Opened " + links.length + " unloaded Tabs");
    return;
  }

  if (cmd === "close") {
    const tabIdsToClose = (await browser.tabs.query({}))
      .filter((t) => links.includes(t.url))
      .map((t) => t.id);

    browser.tabs.remove(tabIdsToClose);

    notify(extname, "Closed " + tabIdsToClose.length + " related Tabs");
    return;
  }

  if (cmd === "select") {
    const tabIdxs = (await browser.tabs.query({}))
      .filter((t) => links.includes(t.url))
      .map((t) => t.index);

    browser.tabs.highlight({ tabs: tabIdxs });
    notify(extname, "Selected " + tabIdxs.length + " related Tabs");
    return;
  }

  if (cmd === "bookmark") {
    const bmtn = await browser.bookmarks.create({
      title: "Link Group " + getTimeStampStr(),
    });

    for (const link of links) {
      browser.bookmarks.create({
        title: link.url,
        parentId: bmtn.id,
        url: link.url,
      });
    }
    notify(extname, "Bookmarked " + links.length + " Links");
    return;
  }

  const anr = parseInt(cmd.split("_")[1]);

  //let tmp = await getFromStorage("object", "selectors", []);
  //let separator = await getFromStorage("string", "separator", "");

  const row = selectors[anr];

  let tmp3 = "";
  let tmp4 = "";

  for (const link of links) {
    const fmtStr = row.format;
    let tmp2 = fmtStr;

    const replacers = new Map();

    const url = new URL(link.url);

    replacers.set("url_proto", url.protocol);
    replacers.set("url_host", url.hostname);
    replacers.set("url_port", url.port);
    replacers.set("url_path", url.pathname);
    replacers.set("url_params", url.search);
    replacers.set("url_origin", url.origin);
    replacers.set("url", url.href);
    replacers.set("text", link.text);

    for (const [k, v] of replacers) {
      tmp2 = tmp2.replaceAll("%" + k, v);
    }
    tmp3 = tmp3 + tmp2 + (separator === "" ? nl : separator);
  }

  tmp3 = tmp3.replaceAll("%nl", nl);

  if (row.html === true) {
    tmp4 += tmp3.replaceAll(nl, br) + "</span>";
    navigator.clipboard.write([
      new ClipboardItem({
        "text/plain": new Blob([tmp3], {
          type: "text/plain",
        }),
        "text/html": new Blob([tmp4], {
          type: "text/html",
        }),
      }),
    ]);
  } else {
    navigator.clipboard.writeText(tmp3);
  }

  notify(extname, "Copied " + links.length + " Links (" + row.name + ")");
}

browser.commands.onCommand.addListener(onCommand);

browser.browserAction.onClicked.addListener(() => {
  browser.runtime.openOptionsPage();
});

browser.runtime.onInstalled.addListener(handleInstalled);

browser.storage.onChanged.addListener(onStorageChange);

browser.menus.onShown.addListener(onMenuShow);

onStorageChange();
